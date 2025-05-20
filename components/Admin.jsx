import React from "react";

const Admin = ({
  isOpen,
  onClose,
  amount,
  loading,
  icoData,
  userTokenBalance,
  isAdmin,
  wallet,
  setAmount,
  createIcoAta,
  depositIco,
  buyTokens,
  userUSDCBalance,
  calculateProgressPercentage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="solana-modal-overlay">
      <div className="solana-modal">
        <button className="solana-modal-close" onClick={onClose}>
          ×
        </button>
        <div className="solana-content">
          <div className="solana-header">
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-500 text-xl font-bold">
              Scythra ICO
            </h1>
          </div>

          {wallet.connected && (
            <div className="solana-wallet-info">
              <p>
                Wallet: {wallet.publicKey.toString().slice(0, 8)}...
                {wallet.publicKey.toString().slice(-8)}
              </p>
              <p>Balance: {userUSDCBalance} USDC </p>
              <p className="USDC-balance">
                <span>Your Token Balance:</span>{" "}
                <span>
                  {userTokenBalance
                    ? (Number(userTokenBalance) / 1e9).toFixed(2)
                    : "0"}{" "}
                  tokens
                </span>
              </p>
            </div>
          )}

          {wallet.connected && (
            <div className="scythra-ico-section">
              {icoData ? (
                <div className="scythra-ico-status">
                  <h2 className="font-bold mb-4">ICO Status</h2>

                  {/* Added progress bar with branded gradient */}
                  <div className="w-full h-2 bg-gray-700 rounded-full mb-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 to-yellow-500 rounded-full"
                      style={{ width: `${calculateProgressPercentage()}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mb-4">
                    <span>{calculateProgressPercentage()}% Complete</span>
                    <span>
                      {icoData.tokensSold?.toString()} /{" "}
                      {icoData.totalTokens?.toString()}
                    </span>
                  </div>

                  <div className="solana-ico-grid">
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <p className="text-gray-400 text-sm">Total Supply</p>
                      <p>{icoData.totalTokens?.toString()} tokens</p>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <p className="text-gray-400 text-sm">Tokens Sold</p>
                      <p>{icoData.tokensSold?.toString()} tokens</p>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <p className="text-gray-400 text-sm">Token Price</p>
                      <p>0.01 USDC</p>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <p className="text-gray-400 text-sm">Available</p>
                      <p>{icoData.totalTokens - icoData.tokensSold} tokens</p>
                    </div>
                  </div>
                </div>
              ) : (
                isAdmin && (
                  <div className="scythra-warning">
                    ICO needs to be initialized
                  </div>
                )
              )}

              <div className="scythra-input-section">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={
                    isAdmin
                      ? icoData
                        ? "Amount of tokens to deposit"
                        : "Amount of tokens to initialize"
                      : "Amount of tokens to buy"
                  }
                  min="1"
                  step="1"
                  className="focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                />

                {amount && !isAdmin && (
                  <div className="solana-cost-breakdown bg-gradient-to-r from-yellow-600/10 to-yellow-600/10 border border-yellow-500/20">
                    <div>
                      <span>Token Amount:</span>
                      <span>{amount} tokens</span>
                    </div>
                    <div>
                      <span>Cost:</span>
                      <span>{(parseInt(amount) * 0.001).toFixed(3)} USDC</span>
                    </div>
                    <div>
                      <span>Network Fee:</span>
                      <span>~0.000005 SOL</span>
                    </div>
                    <div className="solana-total">
                      <span>Total:</span>
                      <span>
                        {(parseInt(amount) * 0.001 + 0.000005).toFixed(6)} USDC
                      </span>
                    </div>
                  </div>
                )}

                {isAdmin ? (
                  <div className="solana-admin-buttons">
                    {!icoData && (
                      <button
                        onClick={createIcoAta}
                        disabled={loading}
                        className="bg-gray-800 hover:bg-gray-700 border border-yellow-500 text-navy"
                      >
                        {loading ? "Initializing..." : "Initialize ICO"}
                      </button>
                    )}
                    {icoData && (
                      <>
                        <button
                          onClick={depositIco}
                          disabled={loading}
                          className="bg-gray-800 hover:bg-gray-700 border border-yellow-500 text-navy"
                        >
                          {loading ? "Depositing..." : "Deposit Tokens"}
                        </button>
                        <button
                          onClick={buyTokens}
                          disabled={loading}
                          className="bg-gradient-to-r from-yellow-600 to-yellow-600 hover:from-yellow-700 hover:to-yellow-700 text-navy"
                        >
                          {loading ? "Processing..." : "Buy Tokens"}
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <button
                    className="solana-buy-button bg-gradient-to-r from-yellow-600 to-yellow-600 hover:from-yellow-700 hover:to-yellow-700 text-white"
                    onClick={buyTokens}
                    disabled={loading || !icoData}
                  >
                    {loading ? "Processing..." : "Buy Tokens"}
                  </button>
                )}

                {loading && (
                  <div className="solana-loading">
                    Processing transaction...
                  </div>
                )}
              </div>
            </div>
          )}

          {!wallet.connected && (
            <div className="solana-connect-prompt text-navy-400">
              Please connect your wallet to continue
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .solana-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.75);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
        }

        .solana-modal {
          background: #0d0b21;
          padding: 2rem;
          border-radius: 1rem;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          animation: slideIn 0.3s ease-out;
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .solana-modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          border: none;
          background: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
          padding: 0.5rem;
          transition: color 0.2s;
        }

        .solana-modal-close:hover {
          color: #000;
        }

        .solana-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .solana-wallet-button {
          background-color: #2cd98f;
          color: #0d0b21;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .solana-wallet-button:hover {
          background-color: #25c280;
          transform: translateY(-2px);
        }

        .solana-wallet-info {
          background-color: rgba(255, 255, 255, 0.05);
          padding: 1.25rem;
          border-radius: 0.75rem;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .solana-admin {
          color: #14f195;
        }
        .solana-user {
          color: #9945ff;
        }

        .solana-ico-status {
          background-color: rgba(255, 255, 255, 0.05);
          padding: 1.5rem;
          border-radius: 0.75rem;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .solana-ico-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
          margin-top: 1rem;
        }

        .solana-warning {
          background-color: #fff3cd;
          color: #856404;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .solana-input-section input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          transition: border-color 0.2s;
          background-color: rgba(255, 255, 255, 0.05);
          color: #fff;
        }

        .solana-input-section input:focus {
          outline: none;
          border-color: #9945ff;
        }

        .solana-input-section input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .solana-cost-breakdown {
          padding: 1.25rem;
          border-radius: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .solana-cost-breakdown > div {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .solana-total {
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          padding-top: 0.75rem;
          font-weight: 600;
        }

        .solana-admin-buttons button,
        .solana-buy-button {
          width: 100%;
          padding: 0.875rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          margin-bottom: 0.75rem;
          font-weight: 600;
          transition: all 0.2s;
        }

        .solana-admin-buttons button:hover,
        .solana-buy-button:hover {
          transform: translateY(-2px);
        }

        .solana-admin-buttons button:disabled,
        .solana-buy-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .solana-loading {
          text-align: center;
          color: #666;
          animation: pulse 2s infinite;
        }

        .solana-connect-prompt {
          text-align: center;
          padding: 2rem;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }

        @media (max-width: 640px) {
          .solana-modal {
            width: 95%;
            padding: 1.5rem;
          }

          .solana-ico-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Admin;
