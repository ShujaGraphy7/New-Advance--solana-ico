// pages/index.js
import React, { useState, useEffect } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import { Program, AnchorProvider, web3, BN } from "@project-serum/anchor";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  createApproveInstruction,
} from "@solana/spl-token";
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import toast from "react-hot-toast";

import IDL from "../idl/idl.json";
import {
  NavBar,
  HeroSection,
  Partners,
  About,
  Process,
  Token,
  Roadmap,
  Feature,
  Footer,
  Admin,
  FAQ,
  ScythraApps,
} from "../components";

const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID);
const ICO_MINT = new PublicKey(process.env.NEXT_PUBLIC_ICO_MINT_TOKEN);
const USDC_MINT = new PublicKey(process.env.NEXT_PUBLIC_USDC_MINT); // Add USDC mint env variable
const TOKEN_DECIMALS = new BN(1_000_000_000);

export default function Home() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [icoData, setIcoData] = useState(null);
  const [amount, setAmount] = useState(" ");
  const isAmountValid = parseFloat(amount) > 0 && !isNaN(parseFloat(amount));
  const [userTokenBalance, setUserTokenBalance] = useState(null);
  const [userSolBalance, setUserSolBalance] = useState(null);
  useEffect(() => {
    // fetchUSDCBalance logic
  }, [wallet?.publicKey]);
  
  useEffect(() => {
    if (wallet.connected) {
      checkIfAdmin();
      fetchIcoData();
      fetchUserTokenBalance();
    }
  }, [wallet.connected]);

  const getProgram = () => {
    if (!wallet.connected) return null;
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    return new Program(IDL, PROGRAM_ID, provider);
  };

  const checkIfAdmin = async () => {
    try {
      const program = getProgram();
      if (!program) return;

      const [dataPda] = await PublicKey.findProgramAddress(
        [Buffer.from("data"), wallet.publicKey.toBuffer()],
        program.programId
      );

      try {
        const data = await program.account.data.fetch(dataPda);
        setIsAdmin(data.admin.equals(wallet.publicKey));
      } catch (e) {
        const accounts = await program.account.data.all();
        if (accounts.length === 0) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          setIcoData(accounts[0].account);
        }
      }
    } catch (error) {
      console.error("Error checking admin:", error);
      setIsAdmin(false);
    }
  };

  const fetchIcoData = async () => {
    try {
      const program = getProgram();
      if (!program) return;

      const accounts = await program.account.data.all();
      if (accounts.length > 0) {
        setIcoData(accounts[0].account);
      }
    } catch (error) {
      console.error("Error fetching ICO data:", error);
    }
  };

  const createIcoAta = async () => {
    try {
      if (!amount || parseInt(amount) <= 0) {
        alert("Please enter a valid amount");
        return;
      }

      setLoading(true);
      const program = getProgram();
      if (!program) return;

      const [icoAtaPda] = await PublicKey.findProgramAddress(
        [ICO_MINT.toBuffer()],
        program.programId
      );

      const [dataPda] = await PublicKey.findProgramAddress(
        [Buffer.from("data"), wallet.publicKey.toBuffer()],
        program.programId
      );

      const adminIcoAta = await getAssociatedTokenAddress(
        ICO_MINT,
        wallet.publicKey
      );

      await program.methods
        .createIcoAta(new BN(amount))
        .accounts({
          icoAtaForIcoProgram: icoAtaPda,
          data: dataPda,
          icoMint: ICO_MINT,
          icoAtaForAdmin: adminIcoAta,
          admin: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      alert("ICO initialized successfully!");
      await fetchIcoData();
    } catch (error) {
      console.error("Error initializing ICO:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const depositIco = async () => {
    try {
      if (!amount || parseInt(amount) <= 0) {
        alert("Please enter a valid amount");
        return;
      }

      setLoading(true);
      const program = getProgram();
      if (!program) return;

      const [icoAtaPda] = await PublicKey.findProgramAddress(
        [ICO_MINT.toBuffer()],
        program.programId
      );

      const [dataPda] = await PublicKey.findProgramAddress(
        [Buffer.from("data"), wallet.publicKey.toBuffer()],
        program.programId
      );

      const adminIcoAta = await getAssociatedTokenAddress(
        ICO_MINT,
        wallet.publicKey
      );

      await program.methods
        .depositIcoInAta(new BN(amount))
        .accounts({
          icoAtaForIcoProgram: icoAtaPda,
          data: dataPda,
          icoMint: ICO_MINT,
          icoAtaForAdmin: adminIcoAta,
          admin: wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      alert("Tokens deposited successfully!");
      await fetchIcoData();
    } catch (error) {
      console.error("Error depositing:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const buyTokens = async () => {
    try {
      if (!amount || parseInt(amount) <= 0) {
        alert("Please enter a valid amount");
        return;
      }

      setLoading(true);
      const program = getProgram();
      if (!program) return;

      const [icoAtaPda, bump] = await PublicKey.findProgramAddress(
        [ICO_MINT.toBuffer()],
        program.programId
      );

      const [dataPda] = await PublicKey.findProgramAddress(
        [Buffer.from("data"), icoData.admin.toBuffer()],
        program.programId
      );

      const userIcoAta = await getAssociatedTokenAddress(
        ICO_MINT,
        wallet.publicKey
      );
      const userUsdcAta = await getAssociatedTokenAddress(
        USDC_MINT,
        wallet.publicKey
      );
      const icoProgramUsdcAta = await getAssociatedTokenAddress(
        USDC_MINT,
        icoData.admin
      );

      // Ensure user ATA exists
      try {
        await getAccount(connection, userIcoAta);
      } catch (e) {
        const createAtaIx = createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          userIcoAta,
          wallet.publicKey,
          ICO_MINT
        );
        const tx = new Transaction().add(createAtaIx);
        await wallet.sendTransaction(tx, connection);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // Approve transfer of USDC from user to contract
      const usdcCost = parseInt(amount); // Assuming 1:1 USDC/token
      const approveIx = createApproveInstruction(
        userUsdcAta,
        icoData.admin,
        wallet.publicKey,
        BigInt(usdcCost)
      );

      const tx = new Transaction().add(approveIx);
      await wallet.sendTransaction(tx, connection);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await program.methods
        .buyTokensWithUsdc(bump, new BN(amount))
        .accounts({
          icoAtaForIcoProgram: icoAtaPda,
          data: dataPda,
          icoMint: ICO_MINT,
          icoAtaForUser: userIcoAta,
          user: wallet.publicKey,
          admin: icoData.admin,
          tokenProgram: TOKEN_PROGRAM_ID,
          userUsdcAta,
          icoProgramUsdcAta,
        })
        .rpc();

      alert(`Successfully purchased ${amount} tokens with USDC!`);
      setAmount("0");
      await fetchIcoData();
      await fetchUserTokenBalance();
    } catch (error) {
      console.error("Error buying tokens:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTokenBalance = async () => {
    try {
      if (!wallet.connected) return;

      const solBalanceLamports = await connection.getBalance(wallet.publicKey);
      setUserSolBalance((solBalanceLamports / web3.LAMPORTS_PER_SOL).toString());

      // Find the associated token address
      const [userAta] = await PublicKey.findProgramAddress(
        [
          wallet.publicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          ICO_MINT.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      try {
        // Check if the account exists first
        const accountInfo = await connection.getAccountInfo(userAta);
        
        // If account doesn't exist, return 0 balance
        if (!accountInfo) {
          console.log("Token account doesn't exist for this wallet");
          setUserTokenBalance("0");
          return;
        }
        
        const tokenAccount = await connection.getTokenAccountBalance(userAta);
        setUserTokenBalance(tokenAccount.value.amount.toString());
      } catch (e) {
        // Don't log expected errors
        if (!e.message.includes("could not find account")) {
          console.log("Error fetching token balance:", e.message);
        }
        setUserTokenBalance("0");
      }
    } catch (error) {
      console.error("Error in fetchUserTokenBalance:", error);
      setUserTokenBalance("0");
      setUserSolBalance("0");
    }
  };

  return (
    <div>
      <NavBar />
      <main>
        <HeroSection
          wallet={wallet}
          isAdmin={isAdmin}
          loading={loading}
          icoData={icoData}
          amount={amount}
          userSolBalance={userSolBalance}
          userTokenBalance={userTokenBalance}
          setAmount={setAmount}
          createIcoAta={createIcoAta}
          depositIco={depositIco}
          buyTokens={buyTokens}
         />
        <Partners />
        <About />
        <Process />
        <Token />
        <Roadmap />
        <Feature />
        <ScythraApps />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
