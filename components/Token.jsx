import React from "react";
import Image from 'next/image';


const Token = () => {
  // Token allocation data for chart
  const tokenData = [
    { name: "Presale", value: 40, color: "#8B5CF6" },
    { name: "Liquidity", value: 20, color: "#10B981" },
    { name: "Development", value: 15, color: "#60A5FA" },
    { name: "Marketing", value: 10, color: "#EC4899" },
    { name: "Team", value: 10, color: "#F59E0B" },
    { name: "Ecosystem", value: 5, color: "#6366F1" },
  ];

  // Token details
  const tokenDetails = [
    { label: "Token Name", value: "Scythra" },
    { label: "Token Symbol", value: "SYTR" },
    { label: "Total Supply", value: "1,000,000,000" },
    { label: "Token Type", value: "SPL (Solana)" },
    { label: "Initial Price", value: "$0.01" },
    { label: "Hard Cap", value: "150,000,000" },
  ];

  <div className="token-benefits bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-yellow-500/30 transition-all duration-300">
  <h3 className="text-white text-xl font-bold mb-6 text-center">
    Token Benefits
  </h3>
  <p className="text-gray-400 text-center">
    Discover the real-world advantages of Scythra—tailored to empower both users and merchants. Stay tuned as more features go live.
  </p>
</div>


  // Custom token allocation chart component - simplified version without Recharts
  const TokenAllocationChart = () => {
    return (
      <div id="chart" className="token-allocation-chart relative">
        <div className="chart-container relative w-64 h-64 mx-auto">
          {/* Simplified pie chart visualization with CSS */}
          <div className="absolute inset-0 rounded-full bg-gray-700"></div>
          <div className="absolute inset-4 rounded-full bg-gray-800 flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-bold text-white">Total Supply</p>
              <p className="text-sm text-gray-400">1 Billion Tokens</p>
            </div>
          </div>

          {/* Segments representation */}
          <div className="absolute inset-0">
            {tokenData.map((item, index) => (
              <div
                key={index}
                className="segment absolute top-0 left-0 w-full h-full"
                style={{
                  clipPath: `polygon(50% 50%, 50% 0, ${
                    50 +
                    40 *
                      Math.cos(((index + 0.5) * 2 * Math.PI) / tokenData.length)
                  }% ${
                    50 +
                    40 *
                      Math.sin(((index + 0.5) * 2 * Math.PI) / tokenData.length)
                  }%)`,
                  backgroundColor: item.color,
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="chart-legend mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
          {tokenData.map((item, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-4 h-4 rounded-sm mr-2"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-gray-300 text-sm">
                {item.name} ({item.value}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section
      id="token"
      className="token-section py-16 md:py-24 bg-gray-900 relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-yellow-600/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-1/4 right-1/4 w-1/2 h-1/2 bg-yellow-600/5 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-5"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <h6 className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-600/10 to-yellow-600/10 text-sm font-medium text-yellow-500 mb-4">
            Tokenomics
          </h6>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            <span className="text-transparent bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-shadow-glow">
              SYTR
            </span>{" "}
            Token Utility & Allocation
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-gray-400 text-lg">
              Our token is designed with sustainability and utility at its core,
              creating long-term value for holders while powering our ecosystem.
            </p>
          </div>
        </div>

        {/* Token information grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Token details card */}
          <div className="token-details bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-yellow-500/30 transition-all duration-300">
            <h3 className="text-white text-xl font-bold mb-6 pb-3 border-b border-gray-700">
              Token Details
            </h3>
            <ul className="space-y-4">
              {tokenDetails.map((detail, index) => (
                <li key={index} className="flex justify-between">
                  <span className="text-gray-400">{detail.label}:</span>
                  <span className="text-white font-medium">{detail.value}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Token allocation chart */}
          <div className="token-allocation bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-yellow-500/30 transition-all duration-300 flex flex-col justify-center">
  <h3 className="text-white text-xl font-bold mb-6 text-center">
    Token Allocation
  </h3>
  <Image
    src="/partners/Tokenomics_-_visual_selection.png" // Replace with your actual path
    alt="Token Allocation"
    width={500} // Adjust as needed
    height={500} // Adjust as needed
    className="mx-auto"
  />
</div>


          {/* Token utility & benefits */}
          <div className="token-utility bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-yellow-500/30 transition-all duration-300">
            <h3 className="text-white text-xl font-bold mb-6 pb-3 border-b border-gray-700">
              Token Utility
            </h3>
            <div className="space-y-6">
            <div className="space-y-6">
            <div className="flex">
  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-600/10 to-yellow-600/10 text-yellow-500 flex items-center justify-center mr-4">
    {/* Icon for staking */}
    <img src="/partners/Front_Coin1.png" alt="Staking Icon" className="w-8 h-8 object-contain" />
  </div>
  <div>
    <h4 className="text-white text-lg font-semibold">Instant Payment Settlements</h4>
    <p className="text-gray-400"> With Scythra, international transactions are processed instantly, providing global reach and enabling businesses and consumers to easily exchange value across borders.</p>
  </div>
</div>


  <div className="flex">
    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-600/10 to-yellow-600/10 text-yellow-500 flex items-center justify-center mr-4">
      {/* Icon for governance */}
      <img src="/partners/Back_Coin1.png" alt="Staking Icon" className="w-8 h-8 object-contain" />
  </div>
  <div>
    <h4 className="text-white text-lg font-semibold">Cross-Border Transaction Efficiency</h4>
    <p className="text-gray-400">Scythra tokens facilitate instant transactions between users and merchants, enabling seamless, real-time payments for goods and services.</p>
  </div>
</div>
    </div>
   


            </div>
          </div>
        </div>

       {/* Vesting & Release Schedule */}
{/* <div className="vesting-schedule bg-gray-800 rounded-xl border border-gray-700 p-6 mb-16">
  <h3 className="text-white text-xl font-bold mb-6">
    Token Release Schedule
  </h3>
  <div className="overflow-x-auto">
    <table className="w-full min-w-full">
      <thead>
        <tr className="border-b border-gray-700">
          <th className="py-3 px-4 text-left text-gray-400 font-medium">
            Allocation
          </th>
          <th className="py-3 px-4 text-left text-gray-400 font-medium">
            TGE Unlock
          </th>
          <th className="py-3 px-4 text-left text-gray-400 font-medium">
            Cliff
          </th>
          <th className="py-3 px-4 text-left text-gray-400 font-medium">
            Vesting Period
          </th>
          <th className="py-3 px-4 text-left text-gray-400 font-medium">
            Unlock Rate
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-700">
        <tr className="hover:bg-gray-800/50">
          <td className="py-3 px-4 text-white">Presale</td>
          <td className="py-3 px-4 text-white">20%</td>
          <td className="py-3 px-4 text-white">None</td>
          <td className="py-3 px-4 text-white">4 months</td>
          <td className="py-3 px-4 text-white">20% monthly</td>
        </tr>
        <tr className="hover:bg-gray-800/50">
          <td className="py-3 px-4 text-white">Team</td>
          <td className="py-3 px-4 text-white">0%</td>
          <td className="py-3 px-4 text-white">6 months</td>
          <td className="py-3 px-4 text-white">18 months</td>
          <td className="py-3 px-4 text-white">Linear vesting</td>
        </tr>
        <tr className="hover:bg-gray-800/50">
          <td className="py-3 px-4 text-white">Marketing</td>
          <td className="py-3 px-4 text-white">10%</td>
          <td className="py-3 px-4 text-white">None</td>
          <td className="py-3 px-4 text-white">12 months</td>
          <td className="py-3 px-4 text-white">Linear vesting</td>
        </tr>
        <tr className="hover:bg-gray-800/50">
          <td className="py-3 px-4 text-white">Liquidity</td>
          <td className="py-3 px-4 text-white">100%</td>
          <td className="py-3 px-4 text-white">None</td>
          <td className="py-3 px-4 text-white">None</td>
          <td className="py-3 px-4 text-white">Unlocked at launch</td>
        </tr>
        <tr className="hover:bg-gray-800/50">
          <td className="py-3 px-4 text-white">Ecosystem</td>
          <td className="py-3 px-4 text-white">5%</td>
          <td className="py-3 px-4 text-white">3 months</td>
          <td className="py-3 px-4 text-white">24 months</td>
          <td className="py-3 px-4 text-white">Linear vesting</td>
        </tr>
      </tbody>
    </table>
  </div>
</div> */}


        {/* CTA - Buy Token */}
        <div className="text-center">
          <div className="max-w-xl mx-auto mb-8">
            <h3 className="text-white text-2xl font-bold mb-4">
              Ready to Invest in the Future?
            </h3>
            <p className="text-gray-400 mb-6">
              Join our presale now to secure SYTR tokens at the lowest price
              before public listing. The price increases after each phase.
            </p>
          </div>

          <div className="inline-block p-0.5 rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-600 shadow-lg">
            <button 
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="bg-gray-900 hover:bg-yellow-800 text-white px-8 py-4 rounded-lg font-medium transition-colors duration-300">
              Buy SYTR Tokens Now
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .grid-pattern {
          background-image: linear-gradient(
              rgba(139, 92, 246, 0.1) 1px,
              transparent 1px
            ),
            linear-gradient(
              to right,
              rgba(139, 92, 246, 0.1) 1px,
              transparent 1px
            );
          background-size: 20px 20px;
        }

        .token-details:hover,
        .token-allocation:hover,
        .token-utility:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px -5px rgba(139, 92, 246, 0.1);
        }

        /* Animated segments for token chart */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .segment {
          animation: fadeIn 0.5s ease-out forwards;
          transform-origin: center;
          opacity: 0.9;
        }

        .segment:hover {
          opacity: 1;
        }
      `}</style>
    </section>
  );
};

export default Token;
