import React from "react";
import Image from "next/image";

const About = () => {
  // Coin features data
  const features = [
    {
      id: 1,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: "Swap App in Development",
      description:
        "A sleek, user-friendly swap app is currently in development, allowing users to buy Scythra with their card or other cryptocurrencies. Users will also be able to seamlessly convert Scythra to fiat or other digital assets, all from one intuitive interface.",
    },
    {
      id: 2,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
      title: "Real-World Utility",
      description:
        "Scythra is being built with real-world application at its core. The ecosystem supports everyday use, ensuring both individuals and businesses can engage with Scythra effortlessly—whether for spending, saving, or swapping.",
    },
    {
      id: 3,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      title: "Merchant Integration",
      description:
        "A custom Shopify payment plugin is underway, enabling merchants to accept Scythra directly at checkout. It includes real-time transaction sync, biometric-verified payments, and seamless storefront integration—all without disrupting the customer journey.",
    },
    {
      id: 4,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
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
      title: "Decentralized Ecosystem",
      description:
        "Fully decentralized infrastructure with transparent operations.",
    },
  ];

  return (
    <section
      id="about"
      className="about-section bg-gray-900 py-16 md:py-24 relative overflow-hidden"
    >
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <h6 className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-600/10 to-yellow-600/10 text-sm font-medium text-yellow-500 mb-4">
            About Scythra
          </h6>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            The Next Generation{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-500">
              Token
            </span>
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-gray-400 text-lg">
            SYTR is designed to power the next generation of finance, with a vision to create a fairer, decentralized world. Built for speed, scalability, and real-world utility, SYTR will play a key role in reshaping how value moves across the globe.
            Now’s your chance to get in early.
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side: Image/Coin visualization */}
          <div className="relative">
            <div className="relative z-10 mx-auto lg:mx-0 max-w-md">
              {/* Main coin image */}
              <div className="relative rounded-full h-64 w-64 mx-auto overflow-hidden mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-yellow-500/20 backdrop-blur-sm rounded-full"></div>
                <div className="absolute inset-2 bg-gray-800 rounded-full flex items-center justify-center">
                  <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-500 animate-pulse-slow">
                    SYTR
                  </div>
                </div>

                {/* Orbital rings animation */}
                <div className="absolute inset-0 token-orbit">
                  <div className="orbital-ring ring1"></div>
                  <div className="orbital-ring ring2"></div>
                </div>

                {/* Floating particles */}
                <div className="particle particle1"></div>
                <div className="particle particle2"></div>
                <div className="particle particle3"></div>
              </div>

              {/* Token stats */}
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div className="stat-card bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <h4 className="text-gray-400 text-sm mb-1">Total Supply</h4>
                  <p className="text-white text-xl font-bold">1,000,000,000</p>
                </div>
                <div className="stat-card bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <h4 className="text-gray-400 text-sm mb-1">Total Presale</h4>
                  <p className="text-white text-xl font-bold">150,000,000</p>
                </div>                    
              </div>
            </div>

            {/* Background glow */}
            <div className="absolute -inset-5 bg-yellow-600/5 blur-3xl rounded-full -z-10"></div>
          </div>

          {/* Right side: Content */}
          <div>
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Reshaping the Future of Finance with Scythra
              </h3>
              <p className="text-gray-400 mb-4">
              Scythra is redefining how people and businesses interact with money. We’re building a powerful, intuitive swap app that will let users 
              buy Scythra with a card or other cryptocurrencies, and seamlessly convert it back to fiat or crypto when needed.
              </p>
              <p className="text-gray-400 mb-4">
              For merchants, a dedicated Shopify plugin is in development — enabling direct Scythra payments with real-time transaction syncing, 
              intelligent authentication, and smooth integration into existing storefronts.

Everything we’re creating is designed to feel effortless, secure, and ahead of its time.
              </p>
            </div>

            {/* Features list */}
            <div className="space-y-6">
              {features.map((feature) => (
                <div key={feature.id} className="feature-card flex items-start">
                  <div className="feature-icon mr-4 p-3 rounded-lg bg-gradient-to-br from-yellow-600/10 to-yellow-600/10 text-purple-500">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-white text-lg font-medium mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="mt-8">
                         </div>
          </div>
        </div>
      </div>

      {/* CSS for animations and effects */}
      <style jsx>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes rotate-reverse {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(5deg);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }

        .orbital-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgb(212,175,55);
          animation: rotate 30s linear infinite;
        }

        .ring1 {
          width: 110%;
          height: 110%;
          top: -5%;
          left: -5%;
        }

        .ring2 {
          width: 140%;
          height: 140%;
          top: -20%;
          left: -20%;
          border-color: rgb(212,175,55);
          animation: rotate-reverse 25s linear infinite;
        }

        .particle {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: linear-gradient(to right, #ffd700, #b89e14);
          animation: float 5s ease-in-out infinite;
        }

        .particle1 {
          top: 20%;
          left: 20%;
          animation-delay: 0s;
        }

        .particle2 {
          top: 70%;
          right: 25%;
          animation-delay: 1.5s;
        }

        .particle3 {
          bottom: 15%;
          left: 30%;
          animation-delay: 3s;
        }

        .stat-card {
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          border-color: rgb(212,175,55);
          box-shadow: 0 10px 25px -5px rgb(212,175,55);
        }

        .feature-card {
          transition: all 0.3s ease;
        }

        .feature-card:hover .feature-icon {
          background: linear-gradient(
            to bottom right,
            rgb(212,175,55),
            rgb(212,175,55)
          );
        }
      `}</style>
    </section>
  );
};

export default About;
