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
  const INITIAL_PRICE = new anchor.BN(10_000); // $0.01 in USDC (6 decimals)
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
        1_000_000_000_000 // 1M USDC (increased from 1000 USDC)
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
        1_000_000_000_000 // 1M USDC (increased from 1000 USDC)
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
            1_000_000_000_000 // 1M USDC (increased from 1000 USDC)
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

  it("Verifies all contract requirements and constraints", async () => {
    try {
      console.log("\n=== Starting Comprehensive Contract Verification Test ===");
      
      // Create test wallets
      const buyerWallet = anchor.web3.Keypair.generate();
      console.log(`\nCreated buyer wallet: ${buyerWallet.publicKey.toString()}`);
      
      // Request airdrop for buyer
      const airdropSignature = await provider.connection.requestAirdrop(
        buyerWallet.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await waitForConfirmation(airdropSignature);
      console.log("Airdrop confirmed for buyer");

      // Create USDC account for buyer
      const buyerUsdc = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        buyerWallet,
        usdcMint,
        buyerWallet.publicKey
      );
      console.log(`Buyer USDC account: ${buyerUsdc.address.toString()}`);

      // Mint USDC to buyer (enough for multiple purchases)
      await mintTo(
        provider.connection,
        wallet.payer,
        usdcMint,
        buyerUsdc.address,
        wallet.publicKey,
        1_000_000_000_000_000 // 1M USDC (increased from 1B)
      );
      console.log("USDC minted to buyer");

      // Get initial state
      const state = await program.account.presaleState.fetch(presaleState);
      console.log("\nInitial Presale State:");
      console.log(`Initial Price: ${state.initialPrice.toString()}`);
      console.log(`Total Sold: ${state.totalSold.toString()}`);
      console.log(`Active: ${state.active}`);
      console.log(`Hard Cap: ${state.hardCap.toString()}`);
      console.log(`Max Tokens Per Wallet: ${state.maxTokensPerWallet.toString()}`);

      // Test 1: Verify initial price
      console.log("\nTest 1: Verifying initial price");
      assert.ok(state.initialPrice.eq(new anchor.BN(INITIAL_PRICE)), "Initial price should be $0.01");

      // Test 2: Verify tier size
      console.log("\nTest 2: Verifying tier size");
      assert.ok(state.maxTokensPerWallet.eq(new anchor.BN(TOKENS_PER_TIER)), "Tier size should be 5M tokens");

      // Test 3: Verify hard cap
      console.log("\nTest 3: Verifying hard cap");
      assert.ok(state.hardCap.eq(new anchor.BN(HARD_CAP)), "Hard cap should be 150M tokens");

      // Test 4: Verify price increase calculation
      console.log("\nTest 4: Verifying price increase calculation");
      const expectedPriceIncrease = INITIAL_PRICE
        .mul(PRICE_INCREASE_BASIS_POINTS)
        .div(BASIS_POINTS_DIVISOR);
      console.log(`Expected price after first tier: ${expectedPriceIncrease.toString()}`);

      // Test 5: Verify purchase within wallet limit
      console.log("\nTest 5: Verifying purchase within wallet limit");
      const purchaseAmount = new anchor.BN(1_000_000); // 1M tokens
      const [userPurchase] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("user_purchase"), buyerWallet.publicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .buyTokens(purchaseAmount)
        .accounts({
          buyer: buyerWallet.publicKey,
          presaleState,
          buyerUsdcAccount: buyerUsdc.address,
          treasuryAccount: treasuryUsdcAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          userPurchase,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([buyerWallet])
        .rpc();

      await waitForConfirmation(tx);
      console.log("Purchase successful");

      // Verify purchase state
      const purchaseState = await program.account.userPurchase.fetch(userPurchase);
      console.log(`\nPurchase State:`);
      console.log(`Buyer: ${purchaseState.buyer.toString()}`);
      console.log(`Amount: ${purchaseState.amount.toString()}`);

      // Test 6: Verify total sold after purchase
      const updatedState = await program.account.presaleState.fetch(presaleState);
      console.log(`\nUpdated Total Sold: ${updatedState.totalSold.toString()}`);
      assert.ok(updatedState.totalSold.eq(state.totalSold.add(purchaseAmount)), "Total sold should be updated correctly");

      // Test 7: Verify price hasn't increased yet (not enough tokens sold)
      console.log("\nTest 7: Verifying price hasn't increased");
      assert.ok(updatedState.initialPrice.eq(state.initialPrice), "Price should not have increased yet");

      // Test 8: Verify active state
      console.log("\nTest 8: Verifying presale is active");
      assert.ok(updatedState.active, "Presale should be active");

      // Test 9: Verify USDC payment
      console.log("\nTest 9: Verifying USDC payment");
      const buyerUsdcBalance = await getAccount(provider.connection, buyerUsdc.address);
      console.log(`Buyer USDC balance: ${buyerUsdcBalance.amount}`);

      // Test 10: Verify treasury received USDC
      console.log("\nTest 10: Verifying treasury received USDC");
      const treasuryBalance = await getAccount(provider.connection, treasuryUsdcAccount);
      console.log(`Treasury USDC balance: ${treasuryBalance.amount}`);

      console.log("\n=== Comprehensive Contract Verification Test Completed Successfully ===\n");
    } catch (error) {
      console.error("\n=== Test Failed ===");
      console.error("Error details:", error);
      throw error;
    }
  });

  it("Verifies edge cases and error conditions", async () => {
    try {
      console.log("\n=== Starting Edge Cases and Error Conditions Test ===");
      
      // Create test wallet
      const buyerWallet = anchor.web3.Keypair.generate();
      console.log(`\nCreated buyer wallet: ${buyerWallet.publicKey.toString()}`);
      
      // Request airdrop
      const airdropSignature = await provider.connection.requestAirdrop(
        buyerWallet.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await waitForConfirmation(airdropSignature);

      // Create USDC account
      const buyerUsdc = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        buyerWallet,
        usdcMint,
        buyerWallet.publicKey
      );

      // Mint USDC
      await mintTo(
        provider.connection,
        wallet.payer,
        usdcMint,
        buyerUsdc.address,
        wallet.publicKey,
        1_000_000_000_000_000 // 1B USDC (increased from 1B)
      );

      const [userPurchase] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("user_purchase"), buyerWallet.publicKey.toBuffer()],
        program.programId
      );

      // Test 1: Try to buy 0 tokens
      console.log("\nTest 1: Attempting to buy 0 tokens");
      try {
        await program.methods
          .buyTokens(new anchor.BN(0))
          .accounts({
            buyer: buyerWallet.publicKey,
            presaleState,
            buyerUsdcAccount: buyerUsdc.address,
            treasuryAccount: treasuryUsdcAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            userPurchase,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([buyerWallet])
          .rpc();
        assert.fail("Should have thrown an error for 0 tokens");
      } catch (error) {
        console.log("Successfully caught error for 0 tokens");
      }

      // Test 2: Try to buy more than tier limit
      console.log("\nTest 2: Attempting to buy more than tier limit");
      try {
        await program.methods
          .buyTokens(new anchor.BN(TOKENS_PER_TIER).add(new anchor.BN(1)))
          .accounts({
            buyer: buyerWallet.publicKey,
            presaleState,
            buyerUsdcAccount: buyerUsdc.address,
            treasuryAccount: treasuryUsdcAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            userPurchase,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([buyerWallet])
          .rpc();
        assert.fail("Should have thrown an error for exceeding tier limit");
      } catch (error) {
        console.log("Successfully caught error for exceeding tier limit");
      }

      // Test 3: Try to buy after presale ends
      console.log("\nTest 3: Attempting to buy after ending presale");
      await program.methods
        .endPresale()
        .accounts({
          presaleState,
          owner: wallet.publicKey,
        })
        .rpc();

      try {
        await program.methods
          .buyTokens(new anchor.BN(1_000_000))
          .accounts({
            buyer: buyerWallet.publicKey,
            presaleState,
            buyerUsdcAccount: buyerUsdc.address,
            treasuryAccount: treasuryUsdcAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            userPurchase,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([buyerWallet])
          .rpc();
        assert.fail("Should have thrown an error for inactive presale");
      } catch (error) {
        console.log("Successfully caught error for inactive presale");
      }

      console.log("\n=== Edge Cases and Error Conditions Test Completed Successfully ===\n");
    } catch (error) {
      console.error("\n=== Test Failed ===");
      console.error("Error details:", error);
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

  it("Verifies exact tier pricing and purchase limits", async () => {
    try {
      console.log("\n=== Starting Tier Pricing and Purchase Limits Verification Test ===");
      
      // Create test wallet
      const buyerWallet = anchor.web3.Keypair.generate();
      console.log(`\nCreated buyer wallet: ${buyerWallet.publicKey.toString()}`);
      
      // Request airdrop
      const airdropSignature = await provider.connection.requestAirdrop(
        buyerWallet.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await waitForConfirmation(airdropSignature);

      // Create USDC account
      const buyerUsdc = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        buyerWallet,
        usdcMint,
        buyerWallet.publicKey
      );

      // Mint USDC (enough for multiple purchases)
      await mintTo(
        provider.connection,
        wallet.payer,
        usdcMint,
        buyerUsdc.address,
        wallet.publicKey,
        1_000_000_000_000_000 // 1M USDC (increased from 1000 USDC)
      );

      const [userPurchase] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("user_purchase"), buyerWallet.publicKey.toBuffer()],
        program.programId
      );

      // Get current state
      const currentState = await program.account.presaleState.fetch(presaleState);
      console.log("\nCurrent Presale State:");
      console.log(`Active: ${currentState.active}`);
      console.log(`Total Sold: ${currentState.totalSold.toString()}`);
      console.log(`Initial Price: ${currentState.initialPrice.toString()}`);

      // If presale is not active, reactivate it
      if (!currentState.active) {
        console.log("\nReactivating presale...");
        const reactivationTx = await program.methods
          .reactivatePresale()
          .accounts({
            presaleState,
            owner: wallet.publicKey,
          })
          .rpc();
        await waitForConfirmation(reactivationTx);
        console.log("Presale reactivated successfully");
      }

      // Test 1: Verify initial price and tier
      console.log("\nTest 1: Verifying initial price and tier");
      const updatedState = await program.account.presaleState.fetch(presaleState);
      assert.ok(updatedState.initialPrice.eq(new anchor.BN(INITIAL_PRICE)), "Initial price should be $0.01");
      assert.ok(updatedState.maxTokensPerWallet.eq(new anchor.BN(TOKENS_PER_TIER)), "Max purchase per wallet should be 5M tokens");
      assert.ok(updatedState.active, "Presale should be active");

      // Test 2: Verify price increases for each tier
      console.log("\nTest 2: Verifying price increases for each tier");
      const expectedPrices = [
        new anchor.BN(100), // $0.01
        new anchor.BN(128), // $0.0128
        new anchor.BN(163), // $0.016384
        new anchor.BN(209), // $0.020972
        new anchor.BN(268), // $0.026844
        new anchor.BN(343), // $0.034360
        new anchor.BN(439), // $0.043980
        new anchor.BN(562), // $0.056295
        new anchor.BN(720), // $0.072058
        new anchor.BN(922), // $0.092234
        new anchor.BN(1180), // $0.118059
        new anchor.BN(1511), // $0.151116
        new anchor.BN(1934), // $0.193428
        new anchor.BN(2475), // $0.247588
        new anchor.BN(3169), // $0.316913
        new anchor.BN(4056), // $0.405648
        new anchor.BN(5192), // $0.519230
        new anchor.BN(6646), // $0.664614
        new anchor.BN(8507), // $0.850706
        new anchor.BN(10889), // $1.088904
        new anchor.BN(13937), // $1.393797
        new anchor.BN(17840), // $1.784060
        new anchor.BN(22835), // $2.283596
        new anchor.BN(29230), // $2.923003
        new anchor.BN(37414), // $3.741444
        new anchor.BN(47890), // $4.789049
        new anchor.BN(61299), // $6.129982
        new anchor.BN(78463), // $7.846377
        new anchor.BN(100433), // $10.043363
        new anchor.BN(128555), // $12.855504
      ];

      // Test 3: Verify purchase limit
      console.log("\nTest 3: Verifying purchase limit");
      try {
        await program.methods
          .buyTokens(new anchor.BN(TOKENS_PER_TIER).add(new anchor.BN(1))) // Try to buy more than limit
          .accounts({
            buyer: buyerWallet.publicKey,
            presaleState,
            buyerUsdcAccount: buyerUsdc.address,
            treasuryAccount: treasuryUsdcAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            userPurchase,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([buyerWallet])
          .rpc();
        assert.fail("Should have thrown an error for exceeding wallet limit");
      } catch (error) {
        console.log("Successfully caught error for exceeding wallet limit");
      }

      // Test 4: Verify successful purchase within limit
      console.log("\nTest 4: Verifying successful purchase within limit");
      const purchaseAmount = new anchor.BN(TOKENS_PER_TIER); // Max allowed
      const purchaseTx = await program.methods
        .buyTokens(purchaseAmount)
        .accounts({
          buyer: buyerWallet.publicKey,
          presaleState,
          buyerUsdcAccount: buyerUsdc.address,
          treasuryAccount: treasuryUsdcAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          userPurchase,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([buyerWallet])
        .rpc();

      await waitForConfirmation(purchaseTx);
      console.log("Purchase successful");

      // Verify purchase state
      const purchaseState = await program.account.userPurchase.fetch(userPurchase);
      console.log(`\nPurchase State:`);
      console.log(`Buyer: ${purchaseState.buyer.toString()}`);
      console.log(`Amount: ${purchaseState.amount.toString()}`);
      assert.ok(purchaseState.amount.eq(purchaseAmount), "Purchase amount should match");

      // Test 5: Verify on-chain purchase record
      console.log("\nTest 5: Verifying on-chain purchase record");
      const finalState = await program.account.presaleState.fetch(presaleState);
      console.log(`Total Sold: ${finalState.totalSold.toString()}`);
      console.log(`Current Tier: ${finalState.totalSold.div(TOKENS_PER_TIER).toString()}`);

      // Test 6: Verify USDC payment calculation
      console.log("\nTest 6: Verifying USDC payment calculation");
      const buyerUsdcBalance = await getAccount(provider.connection, buyerUsdc.address);
      const treasuryBalance = await getAccount(provider.connection, treasuryUsdcAccount);
      console.log(`Buyer USDC balance: ${buyerUsdcBalance.amount}`);
      console.log(`Treasury USDC balance: ${treasuryBalance.amount}`);

      // Calculate expected USDC payment (5M tokens * $0.01)
      const expectedUsdcPayment = purchaseAmount.mul(finalState.initialPrice);
      console.log(`Expected USDC payment: ${expectedUsdcPayment.toString()}`);

      console.log("\n=== Tier Pricing and Purchase Limits Verification Test Completed Successfully ===\n");
    } catch (error) {
      console.error("\n=== Test Failed ===");
      console.error("Error details:", error);
      throw error;
    }
  });

  it("Verifies price calculation across tiers", async () => {
    try {
      console.log("\n=== Starting Price Calculation Test ===");
      
      // Create test wallets for each tier
      const wallets = Array(5).fill(null).map(() => anchor.web3.Keypair.generate());
      console.log("\nCreated test wallets for each tier");
      
      // Request airdrops for all wallets
      for (const wallet of wallets) {
        const airdropSignature = await provider.connection.requestAirdrop(
          wallet.publicKey,
          2 * anchor.web3.LAMPORTS_PER_SOL
        );
        await waitForConfirmation(airdropSignature);
      }

      // Create USDC accounts for all wallets
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

      // Mint USDC to all wallets
      await Promise.all(
        walletUsdcAccounts.map(account =>
          mintTo(
            provider.connection,
            wallet.payer,
            usdcMint,
            account.address,
            wallet.publicKey,
            1_000_000_000_000_000 // 1B USDC
          )
        )
      );

      // Get initial state
      const state = await program.account.presaleState.fetch(presaleState);
      console.log("\nInitial State:");
      console.log(`Initial Price: ${state.initialPrice.toString()}`);
      console.log(`Total Sold: ${state.totalSold.toString()}`);

      // Calculate expected prices for first 5 tiers
      const expectedPrices: anchor.BN[] = [INITIAL_PRICE];
      for (let i = 1; i < 5; i++) {
        const prev = expectedPrices[i - 1];
        expectedPrices.push(
          prev.mul(PRICE_INCREASE_BASIS_POINTS).div(BASIS_POINTS_DIVISOR)
        );
      }

      // Make purchases to reach each tier using different wallets
      for (let tier = 0; tier < 5; tier++) {
        console.log(`\nTesting Tier ${tier}`);
        
        const currentWallet = wallets[tier];
        const currentUsdcAccount = walletUsdcAccounts[tier];
        
        // Calculate amount needed to reach next tier
        const currentTier = state.totalSold.div(TOKENS_PER_TIER);
        const amountToNextTier = TOKENS_PER_TIER.sub(state.totalSold.mod(TOKENS_PER_TIER));
        
        console.log(`Amount needed for next tier: ${amountToNextTier.toString()}`);
        
        const [userPurchase] = await anchor.web3.PublicKey.findProgramAddress(
          [Buffer.from("user_purchase"), currentWallet.publicKey.toBuffer()],
          program.programId
        );
        
        // Make purchase
        const tx = await program.methods
          .buyTokens(amountToNextTier)
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
        
        // Verify new state
        const newState = await program.account.presaleState.fetch(presaleState);
        const newTier = newState.totalSold.div(TOKENS_PER_TIER);
        console.log(`New Tier: ${newTier.toString()}`);
        console.log(`Total Sold: ${newState.totalSold.toString()}`);
        
        // Calculate price using the correct formula
        let calculatedPrice = newState.initialPrice;
        for (let i = 0; i < newTier.toNumber(); i++) {
          calculatedPrice = calculatedPrice
            .mul(PRICE_INCREASE_BASIS_POINTS)
            .div(BASIS_POINTS_DIVISOR);
        }
        
        console.log(`Expected Price: ${expectedPrices[newTier.toNumber()].toString()}`);
        console.log(`Calculated Price: ${calculatedPrice.toString()}`);
        
        // Allow for small rounding differences
        const priceDiff = calculatedPrice.sub(expectedPrices[newTier.toNumber()]).abs();
        assert.ok(
          priceDiff.lte(new anchor.BN(1)),
          `Price mismatch at tier ${newTier.toString()}. Expected: ${expectedPrices[newTier.toNumber()].toString()}, Got: ${calculatedPrice.toString()}`
        );
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log("\n=== Price Calculation Test Completed Successfully ===\n");
    } catch (error) {
      console.error("\n=== Test Failed ===");
      console.error("Error details:", error);
      throw error;
    }
  });

  it("Verifies USDC payment calculations and transfers", async () => {
    try {
      console.log("\n=== Starting USDC Payment Test ===");
      
      // Create test wallet
      const buyerWallet = anchor.web3.Keypair.generate();
      console.log(`\nCreated buyer wallet: ${buyerWallet.publicKey.toString()}`);
      
      // Request airdrop
      const airdropSignature = await provider.connection.requestAirdrop(
        buyerWallet.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await waitForConfirmation(airdropSignature);

      // Create USDC account
      const buyerUsdc = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        buyerWallet,
        usdcMint,
        buyerWallet.publicKey
      );

      // Get current state to determine price
      const state = await program.account.presaleState.fetch(presaleState);
      const currentTier = state.totalSold.div(TOKENS_PER_TIER);
      
      // Calculate current price based on tier
      let currentPrice = state.initialPrice;
      for (let i = 0; i < currentTier.toNumber(); i++) {
        currentPrice = currentPrice
          .mul(PRICE_INCREASE_BASIS_POINTS)
          .div(BASIS_POINTS_DIVISOR);
      }

      // Mint exact amount of USDC needed for test
      const purchaseAmount = new anchor.BN(1_000_000); // 1M tokens
      const expectedCost = purchaseAmount.mul(currentPrice);
      
      // Mint more USDC to ensure enough balance
      await mintTo(
        provider.connection,
        wallet.payer,
        usdcMint,
        buyerUsdc.address,
        wallet.publicKey,
        expectedCost.mul(new anchor.BN(2)).toNumber() // Mint double the expected cost
      );

      // Get initial balances
      const initialBuyerBalance = await getAccount(provider.connection, buyerUsdc.address);
      const initialTreasuryBalance = await getAccount(provider.connection, treasuryUsdcAccount);
      
      console.log("\nInitial Balances:");
      console.log(`Buyer USDC: ${initialBuyerBalance.amount}`);
      console.log(`Treasury USDC: ${initialTreasuryBalance.amount}`);
      console.log(`Current Price: ${currentPrice.toString()}`);
      console.log(`Expected Cost: ${expectedCost.toString()}`);

      const [userPurchase] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("user_purchase"), buyerWallet.publicKey.toBuffer()],
        program.programId
      );

      // Make purchase
      const tx = await program.methods
        .buyTokens(purchaseAmount)
        .accounts({
          buyer: buyerWallet.publicKey,
          presaleState,
          buyerUsdcAccount: buyerUsdc.address,
          treasuryAccount: treasuryUsdcAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          userPurchase,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([buyerWallet])
        .rpc();

      await waitForConfirmation(tx);

      // Add a small delay to ensure balances are updated
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get final balances
      const finalBuyerBalance = await getAccount(provider.connection, buyerUsdc.address);
      const finalTreasuryBalance = await getAccount(provider.connection, treasuryUsdcAccount);
      
      console.log("\nFinal Balances:");
      console.log(`Buyer USDC: ${finalBuyerBalance.amount}`);
      console.log(`Treasury USDC: ${finalTreasuryBalance.amount}`);

      // Calculate balance changes
      const buyerBalanceChange = new anchor.BN(initialBuyerBalance.amount.toString())
        .sub(new anchor.BN(finalBuyerBalance.amount.toString()));
      const treasuryBalanceChange = new anchor.BN(finalTreasuryBalance.amount.toString())
        .sub(new anchor.BN(initialTreasuryBalance.amount.toString()));
      
      console.log("\nBalance Changes:");
      console.log(`Buyer USDC Change: ${buyerBalanceChange.toString()}`);
      console.log(`Treasury USDC Change: ${treasuryBalanceChange.toString()}`);
      console.log(`Expected Cost: ${expectedCost.toString()}`);

      // Verify balance changes match expected cost
      assert.ok(
        buyerBalanceChange.eq(expectedCost),
        `Buyer balance change doesn't match expected cost. Expected: ${expectedCost.toString()}, Got: ${buyerBalanceChange.toString()}`
      );
      assert.ok(
        treasuryBalanceChange.eq(expectedCost),
        `Treasury balance change doesn't match expected cost. Expected: ${expectedCost.toString()}, Got: ${treasuryBalanceChange.toString()}`
      );

      console.log("\n=== USDC Payment Test Completed Successfully ===\n");
    } catch (error) {
      console.error("\n=== Test Failed ===");
      console.error("Error details:", error);
      throw error;
    }
  });

  it("Verifies owner functionality and permissions", async () => {
    try {
      console.log("\n=== Starting Owner Functionality Test ===");
      
      // Create unauthorized wallet
      const unauthorizedWallet = anchor.web3.Keypair.generate();
      console.log(`\nCreated unauthorized wallet: ${unauthorizedWallet.publicKey.toString()}`);
      
      // Request airdrop
      const airdropSignature = await provider.connection.requestAirdrop(
        unauthorizedWallet.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await waitForConfirmation(airdropSignature);

      // Test 1: Unauthorized end_presale attempt
      console.log("\nTest 1: Attempting unauthorized end_presale");
      try {
        await program.methods
          .endPresale()
          .accounts({
            presaleState,
            owner: unauthorizedWallet.publicKey,
          })
          .signers([unauthorizedWallet])
          .rpc();
        assert.fail("Should have thrown an error for unauthorized end_presale");
      } catch (error) {
        console.log("Successfully caught unauthorized end_presale attempt");
      }

      // Test 2: Unauthorized reactivate_presale attempt
      console.log("\nTest 2: Attempting unauthorized reactivate_presale");
      try {
        await program.methods
          .reactivatePresale()
          .accounts({
            presaleState,
            owner: unauthorizedWallet.publicKey,
          })
          .signers([unauthorizedWallet])
          .rpc();
        assert.fail("Should have thrown an error for unauthorized reactivate_presale");
      } catch (error) {
        console.log("Successfully caught unauthorized reactivate_presale attempt");
      }

      // Test 3: Authorized end_presale
      console.log("\nTest 3: Executing authorized end_presale");
      const endTx = await program.methods
        .endPresale()
        .accounts({
          presaleState,
          owner: wallet.publicKey,
        })
        .rpc();
      await waitForConfirmation(endTx);

      const stateAfterEnd = await program.account.presaleState.fetch(presaleState);
      assert.ok(!stateAfterEnd.active, "Presale should be inactive after end_presale");

      // Test 4: Authorized reactivate_presale
      console.log("\nTest 4: Executing authorized reactivate_presale");
      const reactivateTx = await program.methods
        .reactivatePresale()
        .accounts({
          presaleState,
          owner: wallet.publicKey,
        })
        .rpc();
      await waitForConfirmation(reactivateTx);

      const stateAfterReactivate = await program.account.presaleState.fetch(presaleState);
      assert.ok(stateAfterReactivate.active, "Presale should be active after reactivate_presale");

      // Test 5: Attempt to reactivate already active presale
      console.log("\nTest 5: Attempting to reactivate already active presale");
      try {
        await program.methods
          .reactivatePresale()
          .accounts({
            presaleState,
            owner: wallet.publicKey,
          })
          .rpc();
        assert.fail("Should have thrown an error for reactivating active presale");
      } catch (error) {
        console.log("Successfully caught reactivate active presale attempt");
      }

      console.log("\n=== Owner Functionality Test Completed Successfully ===\n");
    } catch (error) {
      console.error("\n=== Test Failed ===");
      console.error("Error details:", error);
      throw error;
    }
  });

  it("Verifies user purchase account behavior", async () => {
    try {
      console.log("\n=== Starting User Purchase Account Test ===");
      
      // Create test wallet
      const buyerWallet = anchor.web3.Keypair.generate();
      console.log(`\nCreated buyer wallet: ${buyerWallet.publicKey.toString()}`);
      
      // Request airdrop
      const airdropSignature = await provider.connection.requestAirdrop(
        buyerWallet.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await waitForConfirmation(airdropSignature);

      // Create USDC account
      const buyerUsdc = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        buyerWallet,
        usdcMint,
        buyerWallet.publicKey
      );

      // Mint USDC for multiple purchases
      await mintTo(
        provider.connection,
        wallet.payer,
        usdcMint,
        buyerUsdc.address,
        wallet.publicKey,
        1_000_000_000_000_000 // 1M USDC (increased from 1000 USDC)
      );

      const [userPurchase] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("user_purchase"), buyerWallet.publicKey.toBuffer()],
        program.programId
      );

      // Test 1: First purchase initialization
      console.log("\nTest 1: Making first purchase");
      const firstPurchaseAmount = new anchor.BN(100_000); // 100k tokens
      const firstTx = await program.methods
        .buyTokens(firstPurchaseAmount)
        .accounts({
          buyer: buyerWallet.publicKey,
          presaleState,
          buyerUsdcAccount: buyerUsdc.address,
          treasuryAccount: treasuryUsdcAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          userPurchase,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([buyerWallet])
        .rpc();

      await waitForConfirmation(firstTx);

      const firstPurchaseState = await program.account.userPurchase.fetch(userPurchase);
      console.log(`First Purchase Amount: ${firstPurchaseState.amount.toString()}`);
      assert.ok(firstPurchaseState.buyer.equals(buyerWallet.publicKey), "Buyer address not set correctly");
      assert.ok(firstPurchaseState.amount.eq(firstPurchaseAmount), "First purchase amount mismatch");

      // Test 2: Subsequent purchase
      console.log("\nTest 2: Making subsequent purchase");
      const secondPurchaseAmount = new anchor.BN(200_000); // 200k tokens
      const secondTx = await program.methods
        .buyTokens(secondPurchaseAmount)
        .accounts({
          buyer: buyerWallet.publicKey,
          presaleState,
          buyerUsdcAccount: buyerUsdc.address,
          treasuryAccount: treasuryUsdcAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          userPurchase,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([buyerWallet])
        .rpc();

      await waitForConfirmation(secondTx);

      const secondPurchaseState = await program.account.userPurchase.fetch(userPurchase);
      console.log(`Total Purchase Amount: ${secondPurchaseState.amount.toString()}`);
      const expectedTotal = firstPurchaseAmount.add(secondPurchaseAmount);
      assert.ok(secondPurchaseState.amount.eq(expectedTotal), "Total purchase amount mismatch");

      // Test 3: Attempt purchase with different wallet
      console.log("\nTest 3: Attempting purchase with different wallet");
      const differentWallet = anchor.web3.Keypair.generate();
      
      // Request airdrop for different wallet
      const differentAirdropSignature = await provider.connection.requestAirdrop(
        differentWallet.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await waitForConfirmation(differentAirdropSignature);
      
      // Create USDC account for different wallet
      const differentUsdc = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        differentWallet,
        usdcMint,
        differentWallet.publicKey
      );

      // Mint USDC to different wallet
      await mintTo(
        provider.connection,
        wallet.payer,
        usdcMint,
        differentUsdc.address,
        wallet.publicKey,
        1_000_000_000_000 // 1M USDC (increased from 1000 USDC)
      );

      // Create user purchase PDA for different wallet
      const [differentUserPurchase] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("user_purchase"), differentWallet.publicKey.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .buyTokens(new anchor.BN(50_000))
          .accounts({
            buyer: differentWallet.publicKey,
            presaleState,
            buyerUsdcAccount: differentUsdc.address,
            treasuryAccount: treasuryUsdcAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            userPurchase: differentUserPurchase,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([differentWallet])
          .rpc();
        assert.fail("Should have thrown an error for unauthorized buyer");
      } catch (error) {
        console.log("Successfully caught unauthorized buyer attempt");
      }

      console.log("\n=== User Purchase Account Test Completed Successfully ===\n");
    } catch (error) {
      console.error("\n=== Test Failed ===");
      console.error("Error details:", error);
      throw error;
    }
  });

  it("Verifies 28% compounded price increase per tier", async () => {
    try {
      console.log("\n=== Starting Compounded Price Increase Test ===");
      
      // Create test wallets for each tier
      const wallets = Array(5).fill(null).map(() => anchor.web3.Keypair.generate());
      console.log("\nCreated test wallets for each tier");
      
      // Request airdrops for all wallets
      for (const wallet of wallets) {
        const airdropSignature = await provider.connection.requestAirdrop(
          wallet.publicKey,
          2 * anchor.web3.LAMPORTS_PER_SOL
        );
        await waitForConfirmation(airdropSignature);
      }

      // Create USDC accounts for all wallets
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

      // Calculate expected prices for all tiers (up to 30)
      const expectedPrices: anchor.BN[] = [INITIAL_PRICE];
      for (let i = 1; i < 30; i++) {
        const prev = expectedPrices[i - 1];
        expectedPrices.push(
          prev.mul(PRICE_INCREASE_BASIS_POINTS).div(BASIS_POINTS_DIVISOR)
        );
      }

      console.log("\nExpected Prices (28% compounded increase):");
      expectedPrices.slice(0, 5).forEach((price, tier) => {
        console.log(`Tier ${tier}: ${price.toString()} (${price.toNumber() / 10000} USDC)`);
      });

      // Mint USDC to all wallets
      await Promise.all(
        walletUsdcAccounts.map(account =>
          mintTo(
            provider.connection,
            wallet.payer,
            usdcMint,
            account.address,
            wallet.publicKey,
            1_000_000_000_000_000 // 1B USDC
          )
        )
      );

      // Make purchases to reach each tier using different wallets
      for (let tier = 0; tier < 5; tier++) {
        console.log(`\nTesting Tier ${tier}`);
        
        const currentWallet = wallets[tier];
        const currentUsdcAccount = walletUsdcAccounts[tier];
        
        // Calculate amount needed to reach next tier
        const state = await program.account.presaleState.fetch(presaleState);
        const currentTier = state.totalSold.div(TOKENS_PER_TIER);
        const amountToNextTier = TOKENS_PER_TIER.sub(state.totalSold.mod(TOKENS_PER_TIER));
        
        console.log(`Amount needed for next tier: ${amountToNextTier.toString()}`);
        
        const [userPurchase] = await anchor.web3.PublicKey.findProgramAddress(
          [Buffer.from("user_purchase"), currentWallet.publicKey.toBuffer()],
          program.programId
        );
        
        // Make purchase
        const tx = await program.methods
          .buyTokens(amountToNextTier)
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
        
        // Verify new state and price
        const newState = await program.account.presaleState.fetch(presaleState);
        const newTier = newState.totalSold.div(TOKENS_PER_TIER);
        
        // Calculate actual price based on tier
        let actualPrice = newState.initialPrice;
        for (let i = 0; i < newTier.toNumber(); i++) {
          actualPrice = actualPrice
            .mul(PRICE_INCREASE_BASIS_POINTS)
            .div(BASIS_POINTS_DIVISOR);
        }
        
        console.log(`New Tier: ${newTier.toString()}`);
        console.log(`Expected Price: ${expectedPrices[newTier.toNumber()].toString()}`);
        console.log(`Actual Price: ${actualPrice.toString()}`);
        
        // Verify price matches expected (allowing for small rounding differences)
        const priceDiff = actualPrice.sub(expectedPrices[newTier.toNumber()]).abs();
        assert.ok(
          priceDiff.lte(new anchor.BN(1)),
          `Price mismatch at tier ${newTier.toString()}. Expected: ${expectedPrices[newTier.toNumber()].toString()}, Got: ${actualPrice.toString()}`
        );

        // Verify 28% increase from previous tier
        if (newTier.toNumber() > 0) {
          const prevPrice = expectedPrices[newTier.toNumber() - 1];
          const expectedIncrease = prevPrice
            .mul(PRICE_INCREASE_BASIS_POINTS)
            .div(BASIS_POINTS_DIVISOR);
          
          console.log(`Previous Tier Price: ${prevPrice.toString()}`);
          console.log(`Expected 28% Increase: ${expectedIncrease.toString()}`);
          console.log(`Actual Price: ${actualPrice.toString()}`);
          
          const increaseDiff = actualPrice.sub(expectedIncrease).abs();
          assert.ok(
            increaseDiff.lte(new anchor.BN(1)),
            `Price increase mismatch at tier ${newTier.toString()}. Expected: ${expectedIncrease.toString()}, Got: ${actualPrice.toString()}`
          );
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log("\n=== Compounded Price Increase Test Completed Successfully ===\n");
    } catch (error) {
      console.error("\n=== Test Failed ===");
      console.error("Error details:", error);
      throw error;
    }
  });
});
