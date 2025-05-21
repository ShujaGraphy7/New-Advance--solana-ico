import React, { useState, useEffect, useMemo, useRef } from "react";
import { FaEthereum } from "react-icons/fa";
import { SiTether } from "react-icons/si";
import { IoWalletOutline } from "react-icons/io5";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { BsFillInfoCircleFill, BsCurrencyDollar } from "react-icons/bs";
import { RiUsdCircleFill } from "react-icons/ri";
import { RxTokens } from "react-icons/rx";
import { PublicKey, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import Admin from "./Admin";

import dynamic from 'next/dynamic';
const Hero = () => {
  return (
    <section id="herosection" className="hero-section">
    
    </section>
  );
};


// Correct usage of PublicKey without `web3`
const USDC_MINT_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_USDC_MINT);

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

// Dummy data instead of environment variables
const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME;
const TOKEN_SYMBOL = process.env.NEXT_PUBLIC_TOKEN_SYMBOL;
const TOKEN_SUPPLY = process.env.NEXT_PUBLIC_TOKEN_SUPPLY;
const PER_TOKEN_USD_PRICE = process.env.NEXT_PUBLIC_PER_TOKEN_USD_PRICE;
const NEXT_PER_TOKEN_USD_PRICE = process.env.NEXT_PUBLIC_NEXT_PER_TOKEN_USD_PRICE;
const PER_TOKEN_USDC_PRICE = process.env.NEXT_PUBLIC_PER_TOKEN_USDC_PRICE;
const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY;
const BLOCKCHAIN = process.env.NEXT_PUBLIC_BLOCKCHAIN;
const MIN_USDC_BALANCE = process.env.NEXT_PUBLIC_MIN_USDC_BALANCE;
const currentTokenPrice = parseFloat(PER_TOKEN_USD_PRICE) || 0;

// Constants for tier logic
const TOKENS_PER_TIER = 5_000_000;
const TOTAL_TIERS = 30;
const HARD_CAP = TOKENS_PER_TIER * TOTAL_TIERS;
const INITIAL_PRICE = 0.01; // $0.01
const PRICE_INCREASE_PERCENTAGE = 28; // 28% increase per tier

// Calculate current tier and price
const calculateCurrentTier = (tokensSold) => {
  return Math.floor(tokensSold / TOKENS_PER_TIER);
};

const calculateCurrentPrice = (tier) => {
  let price = INITIAL_PRICE;
  for (let i = 0; i < tier; i++) {
    price *= (1 + PRICE_INCREASE_PERCENTAGE / 100);
  }
  return price;
};

const calculateNextTierPrice = (currentTier) => {
  return calculateCurrentPrice(currentTier + 1);
};

const calculateTierProgress = (tokensSold) => {
  const currentTier = calculateCurrentTier(tokensSold);
  const tokensInCurrentTier = tokensSold % TOKENS_PER_TIER;
  return (tokensInCurrentTier / TOKENS_PER_TIER) * 100;
};

// Add this function before the HeroSection component
const getUserUSDCBalance = async (publicKey) => {
  try {
    if (!publicKey) return 0;

    // Use a reliable public RPC endpoint
    const connection = new Connection(
      process.env.NEXT_PUBLIC_RPC_ENDPOINT || 
      "https://api.devnet.solana.com", // Default to devnet if no endpoint is provided
      "confirmed"
    );
    
    // Get the associated token account for USDC
    const usdcMint = new PublicKey(process.env.NEXT_PUBLIC_USDC_MINT);
    
    // Find the associated token address
    const [associatedTokenAddress] = await PublicKey.findProgramAddress(
      [
        publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        usdcMint.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    try {
      // Check if the account exists first
      const accountInfo = await connection.getAccountInfo(associatedTokenAddress);
      
      // If account doesn't exist, return 0 balance
      if (!accountInfo) {
        console.log("Token account doesn't exist for this wallet");
        return 0;
      }
      
      // Get the token account info using connection.getTokenAccountBalance
      const tokenAccountInfo = await connection.getTokenAccountBalance(associatedTokenAddress);
      
      // Convert the balance to a decimal number
      const balance = Number(tokenAccountInfo.value.amount) / Math.pow(10, tokenAccountInfo.value.decimals);
      return balance;
    } catch (error) {
      // Don't log expected errors like non-existent accounts
      if (!error.message.includes("could not find account")) {
        console.log("Error fetching token balance:", error.message);
      }
      return 0;
    }
  } catch (error) {
    console.error("Error in getUserUSDCBalance:", error);
    // Return 0 for any error to avoid breaking the UI
    return 0;
  }
};

const HeroSection = ({
  isDarkMode,
  wallet,
  isAdmin,
  loading,
  icoData,
  amount,
  userTokenBalance,
  setAmount,
  createIcoAta,
  depositIco,
  buyTokens,
}) => {
  // Always use dark mode regardless of prop
  isDarkMode = true;

  // State for SYTR amount input
  const [sytrAmount, setSytrAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSufficientBalance, setHasSufficientBalance] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [contractInfo] = useState();
  const [tokenBalances] = useState();
  const [userUSDCBalance, setUserUSDCBalance] = useState(0);
  const [isAmountValid, setIsAmountValid] = useState(false);
  
  // Synchronize sytrAmount with amount for the parent component
  useEffect(() => {
    if (sytrAmount !== '') {
      // Convert to number and back to string to normalize format
      setAmount(parseFloat(sytrAmount).toString());
    } else {
      setAmount('0');
    }
  }, [sytrAmount, setAmount]);
  
  // Validate amount whenever it changes
  useEffect(() => {
    // Check if amount is valid
    const numAmount = parseFloat(sytrAmount);
    const isValid = !isNaN(numAmount) && numAmount > 0;
    
    // Check if user has sufficient balance
    const requiredBalance = numAmount * parseFloat(PER_TOKEN_USDC_PRICE || 1);
    const hasSufficientFunds = userUSDCBalance >= requiredBalance;
    
    setIsAmountValid(isValid);
    setHasSufficientBalance(hasSufficientFunds);
  }, [sytrAmount, userUSDCBalance, PER_TOKEN_USDC_PRICE]);

  // Fetch USDC balance
  useEffect(() => {
    const fetchUSDCBalance = async () => {
      if (wallet?.publicKey) {
        try {
          const fetchedBalance = await getUserUSDCBalance(wallet.publicKey);
          setUserUSDCBalance(fetchedBalance);
        } catch (error) {
          console.error("Failed to fetch USDC balance:", error);
        }
      }
    };
  
    fetchUSDCBalance();
    
    // Set up interval to refresh balance every 30 seconds
    const intervalId = setInterval(fetchUSDCBalance, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [wallet?.publicKey]);

  const handleTokenSelection = (token) => {
    setSelectedToken(token);
    // Reset amount when changing tokens to avoid confusion
    setSytrAmount('');
  };

  // Calculate progress percentage based on sold tokens vs total supply
  const calculateProgressPercentage = () => {
    if (!icoData?.tokensSold?.toString() || !icoData?.totalTokens?.toString())
      return 0;

    const availbleSupply =
      Number(icoData?.tokensSold?.toString()) +
      Number(icoData?.totalTokens?.toString());
    const soldAmount = parseFloat(icoData?.tokensSold?.toString()) || 0;
    const totalSupply = parseFloat(availbleSupply) || 1; // Prevent division by zero

    // Calculate percentage with a maximum of 100%
    const percentage = Math.min((soldAmount / totalSupply) * 100, 100);

    // Return percentage with maximum 2 decimal places
    return parseFloat(percentage.toFixed(2));
  };

  // Execute purchase based on selected token
  const executePurchase = async () => {
    if (!isAmountValid) {
      console.error("Invalid amount");
      return;
    }
    
    if (!hasSufficientBalance) {
      console.error("Insufficient balance");
      return;
    }
    
    setIsLoading(true);
    try {
      await buyTokens();
      // Reset the amount field after successful purchase
      setSytrAmount('');
    } catch (error) {
      console.error("Purchase failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimTokens = async () => {
    if (!wallet.connected) {
      console.error("Wallet not connected");
      return;
    }

    setIsLoading(true);
    try {
      // Since the ICO uses manual token distribution based on on-chain logs,
      // this function will simply log a claim request that can be tracked
      console.log("User requested to claim tokens", {
        wallet: wallet.publicKey.toString(),
        timestamp: new Date().toISOString(),
        tokenBalance: userTokenBalance
      });
      
      // Show a success message to the user
      alert("Your claim has been recorded. Tokens will be distributed manually by the team.");
    } catch (error) {
      console.error("Failed to record claim request:", error);
      alert("Failed to record your claim request. Please try again later or contact support.");
    } finally {
      setIsLoading(false);
    }
  };

  // Determine button state message
  const getButtonMessage = () => {
    if (!wallet.connected) return "Connect Wallet";
    if (!isAmountValid) return "Enter a valid amount";
    if (parseFloat(sytrAmount) <= 0) return "Enter Amount";
    if (!hasSufficientBalance) return "Insufficient Balance";
    return "Buy Now";
  };

  // Get token icon/logo based on selected token
  const getTokenIcon = () => {
    switch (selectedToken) {
      case "USDC":
        return <img className="mr-2 w-4 h-4" src="/partners/USDC.png" alt="USDC" style={{ objectFit: 'contain' }} />;
      default:
        // Scythra icon
        return <img className="mr-2 w-4 h-4" src="/Coin_Symbol1.png" alt="SYTR" style={{ objectFit: 'contain' }} />;
    }
  };

  // Token button styling
  const getTokenButtonStyle = (token) => {
    const isSelected = selectedToken === token;

    return `flex items-center justify-center px-3 py-2 rounded-lg ${
      isSelected
        ? "bg-yellow-700 text-navy shadow-lg shadow-yellow-700/30"
        : isDarkMode
        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    } transition-all duration-300 text-sm font-medium flex-1`;
  };

  // Update the SYTR amount when amount is changed externally
  useEffect(() => {
    // Only update if amount is different to prevent infinite loop
    const numAmount = parseFloat(amount);
    const numSytrAmount = parseFloat(sytrAmount);
    
    if (!isNaN(numAmount) && (isNaN(numSytrAmount) || Math.abs(numAmount - numSytrAmount) > 0.00001)) {
      setSytrAmount(numAmount.toString());
    }
  }, [amount]);

  // Calculate USDC cost based on SYTR amount
  const calculateUSDCCost = () => {
    if (!sytrAmount || isNaN(parseFloat(sytrAmount))) return '';
    
    const numAmount = parseFloat(sytrAmount);
    const currentTier = calculateCurrentTier(icoData?.tokensSold?.toString() || 0);
    const currentPrice = calculateCurrentPrice(currentTier);
    
    const usdcCost = numAmount * currentPrice;
    return usdcCost.toFixed(6); // USDC has 6 decimal places
  };

  // Handle changes to the SYTR amount input
  const handleSytrAmountChange = (e) => {
    const val = e.target.value;
    
    // Allow only digits and optionally one decimal point
    const regex = /^\d*\.?\d*$/;
    
    if (regex.test(val)) {
      setSytrAmount(val);
      
      // Update parent amount state
      if (val !== '') {
        setAmount(parseFloat(val).toString());
      } else {
        setAmount('0');
      }
    }
  };

  // Theme variables - dark mode only
  const bgColor = "bg-gray-900";
  const textColor = "text-white";
  const secondaryTextColor = "text-gray-400";
  const cardBg = "bg-gray-800";
  const cardBorder = "border-gray-700";
  const inputBg = "bg-gray-700 border-gray-600";

  return (
    <div className={`relative w-full overflow-hidden ${bgColor}`}>
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-yellow-600/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-yellow-600/5 rounded-full blur-3xl"></div>

          {/* Orbital circles */}
          <div className="orbital-ring ring1"></div>
          <div className="orbital-ring ring2"></div>
          <div className="orbital-ring ring3"></div>

          {/* Floating elements */}
          <div className="floating-element elem1"></div>
          <div className="floating-element elem2"></div>
          <div className="floating-element elem3"></div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          {/* Left side - Text content */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Status badge */}
            <div className="mt-12 flex justify-center space-x-6">
  {/* Image 1 */}
  <img 
    src="/partners/Front_Coin1.png"  // Replace with your actual image path
    alt="Scythra Front"
    className="w-32 h-32 object-cover rounded-md"  // Adjust size as needed
  />
  
  {/* Image 2 */}
  <img 
    src="/partners/Back_Coin1.png"  // Replace with your actual image path
    alt="Scythra Back"
    className="w-32 h-32 object-cover rounded-md"  // Adjust size as needed
  />
</div>

            

            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${textColor}`}
            >
              Scythra
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-shadow-glow">
                &nbsp; ICO
              </span>
            </h1>

            <div className="relative mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-shadow-glow">
                  Token Presale
                </span>
          
              </h2>
              <div className="absolute -bottom-3 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"></div>
            </div>

            <p
              className={`${secondaryTextColor} text-base md:text-lg max-w-md mb-10 leading-relaxed`}
            >
              SYTR is designed to power the next generation of finance, with a vision to create a fairer, decentralized world. Built for speed, scalability, and real-world utility, SYTR will play a key role in reshaping how value moves across the globe.
              Now's your chance to get in early.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-10">
              <div
                className={`px-4 py-3 rounded-xl ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-100"
                } flex items-center`}
              >
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className={`text-xs ${secondaryTextColor}`}>
                    Early Access
                  </p>
                  <p className={`text-sm font-medium ${textColor}`}>
                    Limited Presale
                  </p>
                </div>
              </div>
              <div
                className={`px-4 py-3 rounded-xl ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-100"
                } flex items-center`}
              >
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-xs ${secondaryTextColor}`}>For You</p>
                  <p className={`text-sm font-medium ${textColor}`}>
                    Exclusive Benefits
                  </p>
                </div>
              </div>
              <div
                className={`px-4 py-3 rounded-xl ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-100"
                } flex items-center`}
              >
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className={`text-xs ${secondaryTextColor}`}>
                    Low Starting
                  </p>
                  <p className={`text-sm font-medium ${textColor}`}>
                    Special Price
                  </p>
                </div>
              </div>
              <div
                className={`px-4 py-3 rounded-xl ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-100"
                } flex items-center`}
              >
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className={`text-xs ${secondaryTextColor}`}>Claim Your Edge</p>
                  <p className={`text-sm font-medium ${textColor}`}>
                    Be First
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Purchase card */}
          <div className="w-full lg:w-1/2 max-w-md mx-auto relative">
            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-navy">Loading...</p>
                </div>
              </div>
            )}

            {/* Card glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-yellow-600 rounded-2xl blur-lg opacity-20"></div>

            {/* Card content */}
            <div
              className={`${cardBg} rounded-2xl shadow-xl overflow-hidden relative z-10 border ${cardBorder}`}
            >
              {/* Card header */}
              <div className="bg-gradient-to-r from-yellow-600 to-yellow-600 py-4 px-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-navy font-bold text-lg">
                    Buy {TOKEN_SYMBOL} Tokens
                  </h3>
                 
                </div>
                <p className="text-navy/80 text-sm">
                  Secure your tokens now
                </p>
              </div>

              <div className="p-6">
                {userUSDCBalance < MIN_USDC_BALANCE && (
                  <div
                    className={`text-center text-xs ${secondaryTextColor} mb-4 bg-yellow-500/5 py-2 px-4 rounded-lg flex items-center justify-center`}
                  >
                    <BsFillInfoCircleFill
                      className="mr-2 text-yellow-500"
                      size={14}
                    />
                    <span>
                      You don't have the minimum balance of {MIN_USDC_BALANCE}{" "}
                      USDC
                    </span>
                  </div>
                )}

                {/* Price info */}
                <div className="flex justify-between bg-gradient-to-r from-yellow-500/5 to-yellow-500/5 rounded-xl p-4 mb-5">
                  <div className="text-center">
                    <p className={`text-xs ${secondaryTextColor} mb-1`}>
                      Current Price
                    </p>
                    <p className={`${textColor} text-lg font-bold`}>
                      ${calculateCurrentPrice(calculateCurrentTier(icoData?.tokensSold?.toString() || 0)).toFixed(4)}
                    </p>
                  </div>
                  <div className="h-auto w-px bg-gradient-to-b from-transparent via-yellow-400/20 to-transparent"></div>
                  <div className="text-center">
                    <p className={`text-xs ${secondaryTextColor} mb-1`}>
                      Next Tier
                    </p>
                    <p className={`${textColor} text-lg font-bold`}>
                      ${calculateNextTierPrice(calculateCurrentTier(icoData?.tokensSold?.toString() || 0)).toFixed(4)}
                    </p>
                  </div>
                </div>

                {/* Tier Progress */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <p className={`text-sm ${secondaryTextColor}`}>
                      Current Tier Progress
                    </p>
                    <p className="text-sm font-medium text-yellow-500">
                      {calculateTierProgress(icoData?.tokensSold?.toString() || 0).toFixed(2)}%
                    </p>
                  </div>
                  <div className="w-full h-3 bg-yellow-200 dark:bg-navy-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-navy-500 relative progress-animation"
                      style={{ width: `${calculateTierProgress(icoData?.tokensSold?.toString() || 0)}%` }}
                    >
                      <div className="absolute inset-0 shimmer"></div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <p className={`text-xs ${secondaryTextColor}`}>
                      Current Tier:{" "}
                      <span className="font-medium text-yellow-500">
                        {calculateCurrentTier(icoData?.tokensSold?.toString() || 0) + 1} / {TOTAL_TIERS}
                      </span>
                    </p>
                    <p className={`text-xs ${secondaryTextColor}`}>
                      Tokens in Tier:{" "}
                      <span className="font-medium text-yellow-500">
                        {(icoData?.tokensSold?.toString() || 0) % TOKENS_PER_TIER} / {TOKENS_PER_TIER}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Token price display */}
                <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/10 rounded-xl p-4 flex items-center justify-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <img
  src="/partners/Coin_Symbol1.png"
  alt={TOKEN_SYMBOL}
  className="w-auto h-auto max-w-[50px] max-h-[50px]"
  style={{ objectFit: 'contain' }}
/>


                  </div>
                  <span className={`${textColor} text-lg font-medium`}>
                    1 {TOKEN_SYMBOL} ={" "}
                  </span>
                  <div className="px-3 py-1.5 rounded-lg bg-yellow-500/20">
                    <span className="text-lg font-bold text-yellow-500">
                      {PER_TOKEN_USDC_PRICE} {CURRENCY}
                    </span>
                  </div>
                </div>

                {/* Token selection */}
                <div className="mb-5">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleTokenSelection("USDC")}
                      className={getTokenButtonStyle("USDC")}
                    >
                      <img
                        className="mr-2 w-4 h-4"
                        src="/partners/USDC.png"
                        alt="SYTR"
                      />
                      {CURRENCY}
                    </button>
                  </div>
                </div>

                {/* Balance display */}
                
                <div
                  className={`flex items-center ${
                    isDarkMode ? "bg-gray-700/50" : "bg-gray-100"
                  } rounded-lg px-4 py-3 mb-5`}
                >
                 
                 <img
                        className="mr-2 w-4 h-4"
                        src="/partners/USDC.png"
                        alt="SYTR"
                      />
                  <div>
                    <p className={`text-xs ${secondaryTextColor}`}>
                      Available Balance
                    </p>
                    
                    <p className={`${textColor} font-medium`}>
                      {userUSDCBalance}{" "}
                      <span className="text-sm">{selectedToken}</span>
                    </p>
                  </div>
                </div>

               {/* SYTR Amount input */}
<div className="space-y-4 mb-6">
  <div>
    <label className={`block ${secondaryTextColor} text-sm mb-2 font-medium`}>
      Quantity (SYTR)
    </label>
    <div className="relative">
      <input
        type="number"
        value={sytrAmount}
        onChange={handleSytrAmountChange}
        
        className={`w-full ${inputBg} rounded-lg border px-4 py-4 ${textColor} focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200`}
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center bg-gray-800 dark:bg-gray-600 px-3 py-1 rounded-lg">
        <span className={`text-sm ${textColor} mr-2`}>SYTR</span>
        <img src="/partners/Coin_Symbol1.png" alt="SYTR Token" className="w-6 h-6" style={{ objectFit: 'contain' }} />
      </div>
    </div>
  </div>
</div>

{/* USDC Payment Display */}
<div>
  <label className={`block ${secondaryTextColor} text-sm mb-2 font-medium`}>
    You Pay (USDC)
  </label>
  <div className="relative">
    <input
      type="number"
      value={calculateUSDCCost()}
      readOnly
      className={`w-full ${inputBg} rounded-lg border px-4 py-4 ${textColor}`}
    />
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center bg-gray-800 dark:bg-gray-600 px-3 py-1 rounded-lg">
      <span className={`text-sm ${textColor} mr-2`}>USDC</span>
      <img src="/partners/USDC.png" alt="USDC" className="w-4 h-4" style={{ objectFit: 'contain' }} />
    </div>
  </div>
</div>


                {/* Action buttons */}
                {wallet.connected ? (
                  <>
                    {icoData ? (
                      <>
                        {userUSDCBalance < MIN_USDC_BALANCE ? (
                          <button
                            className={`w-full bg-gradient-to-r from-yellow-600 to-yellow-600 hover:from-yellow-700 hover:to-yellow-700
                         text-navy rounded-lg py-4 mb-4 flex items-center justify-center transition-all duration-300 font-medium shadow-lg `}
                          >
                            Insufficient Balance, Min Req {MIN_USDC_BALANCE} USDC
                          </button>
                        ) : (
                          <button
                            onClick={executePurchase}
                            disabled={!isAmountValid || !hasSufficientBalance}
                            className={`w-full ${
                              isAmountValid && hasSufficientBalance
                                ? "bg-gradient-to-r from-yellow-600 to-yellow-600 hover:from-yellow-700 hover:to-yellow-700"
                                : isDarkMode
                                ? "bg-gray-700 cursor-not-allowed"
                                : "bg-gray-300 cursor-not-allowed"
                            } text-navy rounded-lg py-4 mb-4 flex items-center justify-center transition-all duration-300 font-medium shadow-lg ${
                              hasSufficientBalance && isAmountValid
                                ? "hover:shadow-yellow-500/20"
                                : ""
                            }`}
                          >
                            {getButtonMessage()}
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        className={`w-full bg-gradient-to-r from-yellow-600 to-yellow-600 hover:from-yellow-700 hover:to-yellow-700
                         text-navy rounded-lg py-4 mb-4 flex items-center justify-center transition-all duration-300 font-medium shadow-lg `}
                      >
                        ICO needs to be initialized
                      </button>
                    )}
                  </>
                ) : (
                  <WalletMultiButton childStyle="w-full mb-4 py-4 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-600 hover:from-yellow-700 hover:to-gold-700 text-navy flex items-center justify-center gap-2 font-medium shadow-lg transition-all duration-300" />
                )}

                {/* Refer a friend button */}

                <button
                  onClick={() => setIsModalOpen(!isModalOpen)}
                  className="w-full py-4 px-6 rounded-lg bg-gray-800 hover:bg-gray-700 text-white mb-4 font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <RxTokens />
                  <span>ICO Details</span>
                </button>
                {wallet.connected && (
  <button
    onClick={handleClaimTokens}
    className="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 text-white font-medium transition-all duration-300 flex items-center justify-center space-x-2 mb-4 shadow-lg"
  >
    <span>Claim Tokens</span>
  </button>
)}

                {/* Help section */}
                <div
                  className={`p-4 rounded-lg ${
                    isDarkMode ? "bg-gray-800/50" : "bg-gray-100"
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <AiOutlineQuestionCircle
                      className="text-yellow-500 mr-2"
                      size={18}
                    />
                    <h4 className={`font-medium ${textColor}`}>Need Help?</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`#process`}
                      className={`${secondaryTextColor} hover:text-yellow-500 flex items-center text-xs transition-colors duration-200 py-1`}
                    >
                      <span className="mr-1 text-yellow-500">•</span>
                      How to Buy Guide
                    </a>
                    <a
                      href={`#about`}
                      className={`${secondaryTextColor} hover:text-yellow-500 flex items-center text-xs transition-colors duration-200 py-1`}
                    >
                      <span className="mr-1 text-yellow-500">•</span>
                      About {TOKEN_SYMBOL}
                    </a>
                    <a
                      href={`#token`}
                      className={`${secondaryTextColor} hover:text-yellow-500 flex items-center text-xs transition-colors duration-200 py-1`}
                    >
                      <span className="mr-1 text-yellow-500">•</span>
                      Token Information
                    </a>
                    <a
                      href={`#faq`}
                      className={`${secondaryTextColor} hover:text-yellow-500 flex items-center text-xs transition-colors duration-200 py-1`}
                    >
                      <span className="mr-1 text-yellow-500">•</span>
                      Frequently Asked Questions
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-600 text-white shadow-lg shadow-yellow-500/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
          aria-label="Scroll to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <Admin
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        wallet={wallet}
        isAdmin={isAdmin}
        loading={loading}
        icoData={icoData}
        amount={amount}
        userUSDCBalance={userUSDCBalance}
        userTokenBalance={userTokenBalance}
        setAmount={setAmount}
        createIcoAta={createIcoAta}
        depositIco={depositIco}
        buyTokens={buyTokens}
        calculateProgressPercentage={calculateProgressPercentage}
      />

      {/* CSS for animations */}
      <style jsx>{`
        /* Orbital animations */
        .orbital-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgb(212,175,55);
          animation: rotate 60s linear infinite;
        }

        .ring1 {
          width: 600px;
          height: 600px;
          top: -100px;
          right: -100px;
        }

        .ring2 {
          width: 800px;
          height: 800px;
          bottom: -200px;
          left: -200px;
          border-color: rgb(212,175,55);
          animation-duration: 90s;
          animation-direction: reverse;
        }

        .ring3 {
          width: 400px;
          height: 400px;
          top: 50%;
          left: 60%;
          border-color: rgb(212,175,55);
          animation-duration: 45s;
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Floating elements */
        .floating-element {
          position: absolute;
          background-color: rgb(212,175,55);
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          animation: float 10s ease-in-out infinite alternate;
        }

        .elem1 {
          width: 300px;
          height: 300px;
          top: 10%;
          right: 10%;
          animation-delay: 0s;
        }

        .elem2 {
          width: 200px;
          height: 200px;
          bottom: 20%;
          left: 15%;
          background-color: rgb(212,175,55);
          animation-delay: 2s;
          animation-duration: 12s;
        }

        .elem3 {
          width: 150px;
          height: 150px;
          top: 40%;
          left: 25%;
          background-color: rgb(0, 50, 70);
          animation-delay: 4s;
          animation-duration: 8s;
        }

        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
            border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
            border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%;
          }
          100% {
            transform: translateY(0) rotate(0deg);
            border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          }
        }

        /* Progress bar animation */
        .progress-animation {
          animation: progress 2s ease-out;
        }

        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: ${calculateProgressPercentage()}%;
          }
        }

        /* Shimmer effect */
        .shimmer {
          animation: shimmer 2s infinite linear;
          background: linear-gradient(
            to right,
            rgb(212,175,55) 0%,
            rgb(212,175,55) 50%,
            rgb(212,175,55) 100%
          );
          background-size: 200% 100%;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
