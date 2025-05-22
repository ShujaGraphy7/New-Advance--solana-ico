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
