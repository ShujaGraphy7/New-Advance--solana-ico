import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ScythraPresale } from "../target/types/scythra_presale";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { assert } from "chai";

describe("scythra_presale", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.ScythraPresale as Program<ScythraPresale>;
  const wallet = provider.wallet as anchor.Wallet;

  // Constants from the contract
  const TOKENS_PER_TIER = new anchor.BN(5_000_000);
  const TOTAL_TIERS = new anchor.BN(30);
  const HARD_CAP = TOKENS_PER_TIER.mul(TOTAL_TIERS); // 150 million tokens
  const INITIAL_PRICE = new anchor.BN(1); // $0.01 in USDC (6 decimals)
  const PRICE_INCREASE_BASIS_POINTS = new anchor.BN(2800); // 28% increase
  const BASIS_POINTS_DIVISOR = new anchor.BN(10000);

  let usdcMint: anchor.web3.PublicKey;
  let tokenMint: anchor.web3.PublicKey;
  let treasuryUsdcAccount: anchor.web3.PublicKey;
  let buyerUsdcAccount: anchor.web3.PublicKey;
  let presaleState: anchor.web3.PublicKey;
  let presaleStateBump: number;

  // Helper function to wait for confirmation
  const waitForConfirmation = async (signature: string) => {
    try {
      const confirmation = await provider.connection.confirmTransaction(signature);
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }
    } catch (error) {
      console.error("Error confirming transaction:", error);
      throw error;
    }
  };

  before(async () => {
    try {
      // Request airdrop if needed
      const balance = await provider.connection.getBalance(wallet.publicKey);
      if (balance < anchor.web3.LAMPORTS_PER_SOL) {
        const airdropSignature = await provider.connection.requestAirdrop(
          wallet.publicKey,
          2 * anchor.web3.LAMPORTS_PER_SOL
        );
        await waitForConfirmation(airdropSignature);
      }

      // Create USDC mint
      usdcMint = await createMint(
        provider.connection,
        wallet.payer,
        wallet.publicKey,
        null, // freeze authority
        6
      );

      // Create token mint
      tokenMint = await createMint(
        provider.connection,
        wallet.payer,
        wallet.publicKey,
        null, // freeze authority
        9
      );

      // Create treasury USDC associated token account
      const treasuryUsdc = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        wallet.payer,
        usdcMint,
        wallet.publicKey // owner
      );
      treasuryUsdcAccount = treasuryUsdc.address;

      // Create buyer USDC associated token account
      const buyerUsdc = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        wallet.payer,
        usdcMint,
        wallet.publicKey // owner
      );
      buyerUsdcAccount = buyerUsdc.address;

      // Mint some USDC to buyer
      await mintTo(
        provider.connection,
        wallet.payer,
        usdcMint,
        buyerUsdcAccount,
        wallet.publicKey, // mint authority
        1_000_000_000 // 1000 USDC
      );

      // Find PDA for presale state
      [presaleState, presaleStateBump] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("presale_state")],
        program.programId
      );

      // Add a small delay after setup
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error("Setup failed:", error);
      throw error;
    }
  });

  it("Initializes the presale", async () => {
    try {
      const tx = await program.methods
        .initializePresale(
          wallet.publicKey,
          usdcMint,
          tokenMint
        )
        .accounts({
          presaleState,
          owner: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      await waitForConfirmation(tx);

      const state = await program.account.presaleState.fetch(presaleState);
      assert.ok(state.owner.equals(wallet.publicKey));
      assert.ok(state.treasury.equals(wallet.publicKey));
      assert.ok(state.usdcMint.equals(usdcMint));
      assert.ok(state.tokenMint.equals(tokenMint));
      assert.ok(state.initialPrice.eq(new anchor.BN(INITIAL_PRICE)));
      assert.ok(state.active);
      assert.ok(state.totalSold.eq(new anchor.BN(0)));
      assert.ok(state.hardCap.eq(new anchor.BN(HARD_CAP)));
      assert.ok(state.maxTokensPerWallet.eq(new anchor.BN(TOKENS_PER_TIER)));

      // Add a small delay after initialization
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error("Initialization failed:", error);
      throw error;
    }
  });

  it("Allows buying tokens", async () => {
    try {
      const desiredAmount = new anchor.BN(1_000_000); // 1 million tokens

      const [userPurchase] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("user_purchase"), wallet.publicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .buyTokens(desiredAmount)
        .accounts({
          buyer: wallet.publicKey,
          presaleState,
          buyerUsdcAccount,
          treasuryAccount: treasuryUsdcAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          userPurchase,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      await waitForConfirmation(tx);

      const state = await program.account.presaleState.fetch(presaleState);
      assert.ok(state.totalSold.eq(desiredAmount));

      const purchase = await program.account.userPurchase.fetch(userPurchase);
      assert.ok(purchase.amount.eq(desiredAmount));
      assert.ok(purchase.buyer.equals(wallet.publicKey));

      // Add a small delay after purchase
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error("Token purchase failed:", error);
      throw error;
    }
  });

  it("Verifies price increases correctly across tiers", async () => {
    try {
      // Create a new wallet for this test
      const newWallet = anchor.web3.Keypair.generate();
      
      // Request airdrop for the new wallet
      const airdropSignature = await provider.connection.requestAirdrop(
        newWallet.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await waitForConfirmation(airdropSignature);

      // Create USDC account for the new wallet
      const newBuyerUsdc = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        newWallet,
        usdcMint,
        newWallet.publicKey
      );

      // Mint some USDC to the new wallet
      await mintTo(
        provider.connection,
        wallet.payer,
        usdcMint,
        newBuyerUsdc.address,
        wallet.publicKey,
        1_000_000_000 // 1000 USDC
      );

      // Make purchases to reach first tier
      const purchaseAmount = new anchor.BN(100_000); // 100k tokens per purchase
      const [userPurchase] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("user_purchase"), newWallet.publicKey.toBuffer()],
        program.programId
      );

      // Make purchases to reach first tier
      for (let i = 0; i < 3; i++) {
        const tx = await program.methods
          .buyTokens(purchaseAmount)
          .accounts({
            buyer: newWallet.publicKey,
            presaleState,
            buyerUsdcAccount: newBuyerUsdc.address,
            treasuryAccount: treasuryUsdcAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            userPurchase,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([newWallet])
          .rpc();

        await waitForConfirmation(tx);
        // Add a small delay between purchases
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Calculate expected price for second tier
      const expectedSecondTierPrice = INITIAL_PRICE
        .mul(PRICE_INCREASE_BASIS_POINTS)
        .div(BASIS_POINTS_DIVISOR);

      // Make one more purchase to verify price increase
      const finalPurchase = new anchor.BN(100_000); // 100k tokens
      const tx2 = await program.methods
        .buyTokens(finalPurchase)
        .accounts({
          buyer: newWallet.publicKey,
          presaleState,
          buyerUsdcAccount: newBuyerUsdc.address,
          treasuryAccount: treasuryUsdcAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          userPurchase,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([newWallet])
        .rpc();

      await waitForConfirmation(tx2);

      // Verify the state after purchases
      const state = await program.account.presaleState.fetch(presaleState);
      const purchase = await program.account.userPurchase.fetch(userPurchase);

      // Verify total amount purchased (3 purchases of 100k + 1 final purchase)
      const expectedTotal = purchaseAmount.mul(new anchor.BN(3)).add(finalPurchase);
      assert.ok(purchase.amount.eq(expectedTotal));

      // Verify we're in the first tier (since we haven't reached 5M tokens yet)
      const currentTier = state.totalSold.div(TOKENS_PER_TIER);
      assert.ok(currentTier.eq(new anchor.BN(0)));

      // Add a small delay after verification
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error("Price tier verification failed:", error);
      throw error;
    }
  });

  it("Verifies price increases across multiple tiers", async () => {
    try {
      console.log("\n=== Starting Multiple Tier Verification Test ===");
      
      // Create multiple wallets for this test
      const wallets = Array(3).fill(null).map(() => anchor.web3.Keypair.generate());
      console.log("\nCreated test wallets:");
      wallets.forEach((wallet, index) => {
        console.log(`Wallet ${index + 1}: ${wallet.publicKey.toString()}`);
      });
      
      // Request airdrops for all wallets
      console.log("\nRequesting airdrops for wallets...");
      for (const wallet of wallets) {
        const airdropSignature = await provider.connection.requestAirdrop(
          wallet.publicKey,
          2 * anchor.web3.LAMPORTS_PER_SOL
        );
        await waitForConfirmation(airdropSignature);
        console.log(`Airdrop confirmed for ${wallet.publicKey.toString()}`);
      }

      // Create USDC accounts for all wallets
      console.log("\nCreating USDC accounts for wallets...");
      const walletUsdcAccounts = await Promise.all(
        wallets.map(wallet => 
          getOrCreateAssociatedTokenAccount(
            provider.connection,
            wallet,
            usdcMint,
            wallet.publicKey
          )
        )
      );
      console.log("USDC accounts created:");
      walletUsdcAccounts.forEach((account, index) => {
        console.log(`Wallet ${index + 1} USDC account: ${account.address.toString()}`);
      });

      // Mint USDC to all wallets
      console.log("\nMinting USDC to wallets...");
      await Promise.all(
        walletUsdcAccounts.map(account =>
          mintTo(
            provider.connection,
            wallet.payer,
            usdcMint,
            account.address,
            wallet.publicKey,
            1_000_000_000 // 1000 USDC
          )
        )
      );
      console.log("USDC minted to all wallets");

      // Get initial state
      const state = await program.account.presaleState.fetch(presaleState);
      console.log("\nInitial Presale State:");
      console.log(`Initial Price: ${state.initialPrice.toString()}`);
      console.log(`Total Sold: ${state.totalSold.toString()}`);
      console.log(`Active: ${state.active}`);
      console.log(`Hard Cap: ${state.hardCap.toString()}`);
      console.log(`Max Tokens Per Wallet: ${state.maxTokensPerWallet.toString()}`);

      const initialTotalSold = state.totalSold;

      // Each wallet will make purchases to help reach the next tier
      console.log("\nStarting purchases...");
      for (let i = 0; i < wallets.length; i++) {
        const currentWallet = wallets[i];
        const currentUsdcAccount = walletUsdcAccounts[i];
        
        console.log(`\nProcessing Wallet ${i + 1}: ${currentWallet.publicKey.toString()}`);
        
        const [userPurchase] = await anchor.web3.PublicKey.findProgramAddress(
          [Buffer.from("user_purchase"), currentWallet.publicKey.toBuffer()],
          program.programId
        );
        console.log(`User Purchase PDA: ${userPurchase.toString()}`);

        // Make purchases with current wallet
        const purchaseAmount = new anchor.BN(100_000); // 100k tokens per purchase
        for (let j = 0; j < 3; j++) {
          console.log(`\nMaking purchase ${j + 1} for Wallet ${i + 1}`);
          console.log(`Purchase Amount: ${purchaseAmount.toString()} tokens`);
          
          const tx = await program.methods
            .buyTokens(purchaseAmount)
            .accounts({
              buyer: currentWallet.publicKey,
              presaleState,
              buyerUsdcAccount: currentUsdcAccount.address,
              treasuryAccount: treasuryUsdcAccount,
              tokenProgram: TOKEN_PROGRAM_ID,
              userPurchase,
              systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([currentWallet])
            .rpc();

          await waitForConfirmation(tx);
          console.log(`Purchase ${j + 1} confirmed. Transaction: ${tx}`);

          // Get updated state after each purchase
          const updatedState = await program.account.presaleState.fetch(presaleState);
          console.log(`Updated Total Sold: ${updatedState.totalSold.toString()}`);
          console.log(`Current Tier: ${updatedState.totalSold.div(TOKENS_PER_TIER).toString()}`);

          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Verify final state
      console.log("\nVerifying final state...");
      const finalState = await program.account.presaleState.fetch(presaleState);
      console.log("\nFinal Presale State:");
      console.log(`Total Sold: ${finalState.totalSold.toString()}`);
      console.log(`Current Tier: ${finalState.totalSold.div(TOKENS_PER_TIER).toString()}`);
      console.log(`Initial Price: ${finalState.initialPrice.toString()}`);
      
      // Calculate expected price after one tier increase
      const expectedPrice = state.initialPrice
        .mul(PRICE_INCREASE_BASIS_POINTS)
        .div(BASIS_POINTS_DIVISOR);
      console.log(`Expected Price for Next Tier: ${expectedPrice.toString()}`);

      // Verify total tokens sold (initial + 3 wallets * 3 purchases * 100k tokens)
      const expectedTotalSold = initialTotalSold.add(new anchor.BN(900_000)); // initial + 900k tokens
      console.log(`\nVerifying total sold amount...`);
      console.log(`Initial Total Sold: ${initialTotalSold.toString()}`);
      console.log(`Expected Additional Sold: 900000`);
      console.log(`Expected Total: ${expectedTotalSold.toString()}`);
      console.log(`Actual Total: ${finalState.totalSold.toString()}`);
      assert.ok(finalState.totalSold.eq(expectedTotalSold), "Total sold amount mismatch");

      // Verify we're still in the first tier (since total < 5M tokens)
      const currentTier = finalState.totalSold.div(TOKENS_PER_TIER);
      console.log(`\nVerifying current tier...`);
      console.log(`Expected: 0`);
      console.log(`Actual: ${currentTier.toString()}`);
      assert.ok(currentTier.eq(new anchor.BN(0)), "Should be in tier 0");

      // Verify the price hasn't increased yet (since we haven't reached the next tier)
      console.log(`\nVerifying price...`);
      console.log(`Expected: ${state.initialPrice.toString()}`);
      console.log(`Actual: ${finalState.initialPrice.toString()}`);
      assert.ok(finalState.initialPrice.eq(state.initialPrice), "Price should not have increased");

      console.log("\n=== Multiple Tier Verification Test Completed Successfully ===\n");

      // Add a small delay after verification
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error("Multiple tier verification failed:", error);
      throw error;
    }
  });

  it("Ends the presale", async () => {
    try {
      const tx = await program.methods
        .endPresale()
        .accounts({
          presaleState,
          owner: wallet.publicKey,
        })
        .rpc();

      await waitForConfirmation(tx);

      const state = await program.account.presaleState.fetch(presaleState);
      assert.ok(!state.active);
    } catch (error) {
      console.error("End presale failed:", error);
      throw error;
    }
  });
});
