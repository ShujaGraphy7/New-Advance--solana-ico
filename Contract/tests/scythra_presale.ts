import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ScythraPresale } from "../target/types/scythra_presale";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { assert } from "chai";

describe("scythra_presale", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.ScythraPresale as Program<ScythraPresale>;
  const wallet = provider.wallet as anchor.Wallet;

  let usdcMint: anchor.web3.PublicKey;
  let tokenMint: anchor.web3.PublicKey;
  let treasuryUsdcAccount: anchor.web3.PublicKey;
  let buyerUsdcAccount: anchor.web3.PublicKey;
  let presaleState: anchor.web3.PublicKey;
  let presaleStateBump: number;

  const TOKENS_PER_TIER = new anchor.BN(5_000_000);
  const INITIAL_PRICE = new anchor.BN(1);

  before(async () => {
    // Create USDC mint
    usdcMint = await createMint(
      provider.connection,
      wallet.payer,
      wallet.publicKey,
      null,
      6
    );

    // Create token mint
    tokenMint = await createMint(
      provider.connection,
      wallet.payer,
      wallet.publicKey,
      null,
      9
    );

    // Create treasury USDC account
    treasuryUsdcAccount = await createAccount(
      provider.connection,
      wallet.payer,
      usdcMint,
      wallet.publicKey
    );

    // Create buyer USDC account
    buyerUsdcAccount = await createAccount(
      provider.connection,
      wallet.payer,
      usdcMint,
      wallet.publicKey
    );

    // Mint some USDC to buyer
    await mintTo(
      provider.connection,
      wallet.payer,
      usdcMint,
      buyerUsdcAccount,
      wallet.publicKey,
      1_000_000_000 // 1000 USDC
    );

    // Find PDA for presale state
    [presaleState, presaleStateBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("presale_state")],
      program.programId
    );
  });

  it("Initializes the presale", async () => {
    await program.methods
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

    const state = await program.account.presaleState.fetch(presaleState);
    assert.ok(state.owner.equals(wallet.publicKey));
    assert.ok(state.treasury.equals(wallet.publicKey));
    assert.ok(state.usdcMint.equals(usdcMint));
    assert.ok(state.tokenMint.equals(tokenMint));
    assert.ok(state.initialPrice.eq(INITIAL_PRICE));
    assert.ok(state.active);
    assert.ok(state.totalSold.eq(new anchor.BN(0)));
  });

  it("Allows buying tokens", async () => {
    const desiredAmount = new anchor.BN(1_000_000); // 1 million tokens

    const [userPurchase] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("user_purchase"), wallet.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
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

    const state = await program.account.presaleState.fetch(presaleState);
    assert.ok(state.totalSold.eq(desiredAmount));

    const purchase = await program.account.userPurchase.fetch(userPurchase);
    assert.ok(purchase.amount.eq(desiredAmount));
    assert.ok(purchase.buyer.equals(wallet.publicKey));
  });

  it("Ends the presale", async () => {
    await program.methods
      .endPresale()
      .accounts({
        presaleState,
        owner: wallet.publicKey,
      })
      .rpc();

    const state = await program.account.presaleState.fetch(presaleState);
    assert.ok(!state.active);
  });
});
