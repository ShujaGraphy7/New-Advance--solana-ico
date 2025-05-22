import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ScythraPresale } from "../target/types/scythra_presale";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { assert } from "chai";

describe("initialize_presale", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.ScythraPresale as Program<ScythraPresale>;
  const wallet = provider.wallet as anchor.Wallet;

  // Constants from the contract
  const TOKENS_PER_TIER = new anchor.BN(5_000_000);
  const TOTAL_TIERS = new anchor.BN(30);
  const HARD_CAP = TOKENS_PER_TIER.mul(TOTAL_TIERS); // 150 million tokens
  const INITIAL_PRICE = new anchor.BN(100); // $0.01 in USDC (6 decimals)
  const PRICE_INCREASE_BASIS_POINTS = new anchor.BN(12800); // 128% (100% + 28% increase)
  const BASIS_POINTS_DIVISOR = new anchor.BN(10000);

  let usdcMint: anchor.web3.PublicKey;
  let tokenMint: anchor.web3.PublicKey;
  let treasuryUsdcAccount: anchor.web3.PublicKey;
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

  it("Initializes the presale and logs all PDA details", async () => {
    try {
      console.log("\n=== Starting Presale Initialization Test ===");

      // Request airdrop if needed
      const balance = await provider.connection.getBalance(wallet.publicKey);
      if (balance < anchor.web3.LAMPORTS_PER_SOL) {
        console.log("\nRequesting SOL airdrop...");
        const airdropSignature = await provider.connection.requestAirdrop(
          wallet.publicKey,
          2 * anchor.web3.LAMPORTS_PER_SOL
        );
        await waitForConfirmation(airdropSignature);
        console.log("Airdrop confirmed");
      }

      // Create USDC mint
      console.log("\nCreating USDC mint...");
      usdcMint = await createMint(
        provider.connection,
        wallet.payer,
        wallet.publicKey,
        null, // freeze authority
        6 // decimals
      );
      console.log(`USDC Mint: ${usdcMint.toString()}`);

      // Create token mint
      console.log("\nCreating token mint...");
      tokenMint = await createMint(
        provider.connection,
        wallet.payer,
        wallet.publicKey,
        null, // freeze authority
        9 // decimals
      );
      console.log(`Token Mint: ${tokenMint.toString()}`);

      // Create treasury USDC associated token account
      console.log("\nCreating treasury USDC account...");
      const treasuryUsdc = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        wallet.payer,
        usdcMint,
        wallet.publicKey // owner
      );
      treasuryUsdcAccount = treasuryUsdc.address;
      console.log(`Treasury USDC Account: ${treasuryUsdcAccount.toString()}`);

      // Find PDA for presale state
      console.log("\nFinding presale state PDA...");
      [presaleState, presaleStateBump] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("presale_state")],
        program.programId
      );
      console.log(`Presale State PDA: ${presaleState.toString()}`);
      console.log(`Presale State Bump: ${presaleStateBump}`);

      // Initialize presale
      console.log("\nInitializing presale...");
      const tx = await program.methods
        .initializePresale(
          wallet.publicKey, // treasury
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
      console.log("Presale initialization transaction confirmed");

      // Fetch and log presale state
      console.log("\nFetching presale state...");
      const state = await program.account.presaleState.fetch(presaleState);
      
      console.log("\n=== Presale State Details ===");
      console.log(`Owner: ${state.owner.toString()}`);
      console.log(`Treasury: ${state.treasury.toString()}`);
      console.log(`USDC Mint: ${state.usdcMint.toString()}`);
      console.log(`Token Mint: ${state.tokenMint.toString()}`);
      console.log(`Initial Price: ${state.initialPrice.toString()}`);
      console.log(`Start Time: ${new Date(state.startTime.toNumber() * 1000).toISOString()}`);
      console.log(`Total Sold: ${state.totalSold.toString()}`);
      console.log(`Active: ${state.active}`);
      console.log(`Hard Cap: ${state.hardCap.toString()}`);
      console.log(`Max Tokens Per Wallet: ${state.maxTokensPerWallet.toString()}`);

      // Verify state
      console.log("\nVerifying state...");
      assert.ok(state.owner.equals(wallet.publicKey), "Owner mismatch");
      assert.ok(state.treasury.equals(wallet.publicKey), "Treasury mismatch");
      assert.ok(state.usdcMint.equals(usdcMint), "USDC mint mismatch");
      assert.ok(state.tokenMint.equals(tokenMint), "Token mint mismatch");
      assert.ok(state.initialPrice.eq(new anchor.BN(INITIAL_PRICE)), "Initial price mismatch");
      assert.ok(state.active, "Presale should be active");
      assert.ok(state.totalSold.eq(new anchor.BN(0)), "Total sold should be 0");
      assert.ok(state.hardCap.eq(new anchor.BN(HARD_CAP)), "Hard cap mismatch");
      assert.ok(state.maxTokensPerWallet.eq(new anchor.BN(TOKENS_PER_TIER)), "Max tokens per wallet mismatch");

      // Log all PDAs that will be used
      console.log("\n=== All PDAs Used in Contract ===");
      console.log("1. Presale State PDA:");
      console.log(`   - Address: ${presaleState.toString()}`);
      console.log(`   - Seeds: ["presale_state"]`);
      console.log(`   - Bump: ${presaleStateBump}`);

      console.log("\n2. User Purchase PDAs (will be created per user):");
      console.log("   - Seeds: [\"user_purchase\", user_public_key]");
      console.log("   - Example for current wallet:");
      const [userPurchase] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("user_purchase"), wallet.publicKey.toBuffer()],
        program.programId
      );
      console.log(`   - Address: ${userPurchase.toString()}`);

      console.log("\n=== Contract Constants ===");
      console.log(`TOKENS_PER_TIER: ${TOKENS_PER_TIER.toString()}`);
      console.log(`TOTAL_TIERS: ${TOTAL_TIERS.toString()}`);
      console.log(`HARD_CAP: ${HARD_CAP.toString()}`);
      console.log(`INITIAL_PRICE: ${INITIAL_PRICE.toString()}`);
      console.log(`PRICE_INCREASE_BASIS_POINTS: ${PRICE_INCREASE_BASIS_POINTS.toString()}`);
      console.log(`BASIS_POINTS_DIVISOR: ${BASIS_POINTS_DIVISOR.toString()}`);

      console.log("\n=== Presale Initialization Test Completed Successfully ===\n");
    } catch (error) {
      console.error("\n=== Test Failed ===");
      console.error("Error details:", error);
      throw error;
    }
  });
}); 