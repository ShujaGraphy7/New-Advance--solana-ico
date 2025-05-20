import React from "react";
import { Link } from 'react-scroll'; // For smooth scrolling



const Process = () => {
  // Process steps data
  const steps = [
    {
      id: 1,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>
      ),
      title: "Connect Wallet",
      description:
        "Connect your Solana wallet to our platform. We support Phantom, Solflare, and other popular Solana wallets.",
      buttonText: "Learn How",
      buttonLink: "#connect-guide",
    },
    {
      id: 2,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      title: "Fund Your Wallet",
      description:
        "Ensure you have sufficient USDC in your wallet to participate in the token sale and cover transaction fees.",
      buttonText: "Get USDC",
      buttonLink: "#get-usdc",
    },
    {
      id: 3,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
      title: "Purchase Tokens",
      description:
        "Enter the amount of USDC you want to spend, and our system will calculate the number of tokens you'll receive.",
      buttonText: "Buy Tokens",
      buttonLink: "#buy",
    },
    {
      id: 4,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Confirm Transaction",
      description:
        "Review and confirm the transaction details in your wallet. Once approved, your transaction will be stored on chain.",
      buttonText: "View Status",
      buttonLink: "#transaction-status",
    },
  ];

  return (
    <section
      id="process"
      className="process-section py-16 md:py-24 bg-gray-900 relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-yellow-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-yellow-600/5 rounded-full blur-3xl"></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-10"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <h6 className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-600/10 to-yellow-600/10 text-sm font-medium text-yellow-500 mb-4">
            How It Works
          </h6>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Simple{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-500">
              4-Step
            </span>{" "}
            Process
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-gray-400 text-lg">
              Getting started with SCythra token is quick and easy. Follow these
              simple steps to participate in our token sale.
            </p>
          </div>
        </div>

        {/* Process steps */}
        <div className="steps-container relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute left-1/2 top-24 bottom-24 w-0.5 bg-gradient-to-b from-yellow-500 via-yellow-500 to-yellow-500 transform -translate-x-1/2 z-0"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`step-card relative ${
                  index % 2 === 1 ? "lg:mt-32" : ""
                }`}
              >
                {/* Step number indicator - visible only on desktop */}
                <div className="hidden lg:flex absolute z-20 left-0 top-8 transform -translate-x-full -translate-y-1/2 lg:translate-x-1/2">
                  <div className="w-12 h-12 rounded-full bg-gray-800 border-4 border-gray-900 flex items-center justify-center">
                    <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-500">
                      {step.id}
                    </span>
                  </div>
                </div>

                {/* Card */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-500/30 transition-all duration-300 group">
                  <div className="flex items-start">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br from-yellow-600/10 to-yellow-600/10 text-yellow-500 flex items-center justify-center mr-4 group-hover:from-yellow-600/20 group-hover:to-yellow-600/20 transition-colors duration-300">
                      {/* Icon removed */}
<div className="flex-shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br from-yellow-600/10 to-yellow-600/10 text-yellow-500 flex items-center justify-center mr-4 group-hover:from-yellow-600/20 group-hover:to-yellow-600/20 transition-colors duration-300">
  {/* Icon has been removed */}
</div>

                    </div>

                    {/* Content */}
                    <div className="flex-grow">
                      <div className="flex items-center mb-2">
                        {/* Mobile step indicator */}
                        <div className="flex lg:hidden items-center justify-center w-6 h-6 rounded-full bg-yellow-500/20 mr-2">
                          <span className="text-sm font-bold text-yellow-500">
                            {step.id}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-gray-400 mb-4">{step.description}</p>
                     </div>
                  </div>
                </div>

                {/* Connector dots for mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mx-0.5"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mx-0.5"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mx-0.5"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-white mb-6">
            Ready to Get Started?
          </h3>
          <div className="inline-block p-0.5 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-600 shadow-lg">
         
  <button 
  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
  className="bg-gray-900 hover:bg-yellow-800 text-white px-8 py-4 rounded-lg font-medium transition-colors duration-300">
    Join Token Sale Now
  </button>

          </div>
        </div>
      </div>

      <style jsx>{`
        .grid-pattern {
          background-image: linear-gradient(
              rgb(212,175,55) 1px,
              transparent 1px
            ),
            linear-gradient(
              to right,
              rgb(212,175,55) 1px,
              transparent 1px
            );
          background-size: 40px 40px;
        }

        .step-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px -5px rgb(212,175,55);
        }

        /* Responsive timeline adjustments */
        @media (min-width: 1024px) {
          .step-card:nth-child(even) {
            transform: translateX(20px);
          }

          .step-card:nth-child(odd) {
            transform: translateX(-20px);
          }

          .step-card:hover {
            transform: translateY(-5px) translateX(0);
          }
        }
      `}</style>
    </section>
  );
};

export default Process;
