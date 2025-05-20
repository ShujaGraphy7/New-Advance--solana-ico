import React, { useState } from "react";

const Features = () => {
  const [activeTab, setActiveTab] = useState("platform"); // Default active tab

  // Feature data
  const featureTabs = [
    {
      id: "platform",
      title: "Platform",
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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
    {
      id: "security",
      title: "Security",
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
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
    
   
  ];

  // Features for each tab
  const features = {
    platform: [
      {
        id: 1,
        title: "Lightning Fast Transactions",
        description:
          "Experience near-instant transaction finality with Solana's high-performance blockchain, processing thousands of transactions per second with minimal fees.",
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        ),
      },
      {
        id: 2,
        title: "Seamless User Interface",
        description:
          "Our intuitive platform makes cryptocurrency interactions simple for both beginners and experienced users, with a clean design and straightforward navigation.",
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
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        ),
      },
      {
        id: 3,
        title: "Cross-Platform Compatibility",
        description:
          "Access your assets from any device with our web application, mobile apps, and browser extensions, ensuring you're always connected to your investments.",
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
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        ),
      },
    ],
    security: [
      {
        id: 1,
        title: "Multi-Layer Security",
        description:
          "Your assets are protected by multiple security layers, including advanced encryption, secure key management, and regular security audits by leading firms.",
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
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        ),
      },
      {
        id: 2,
        title: "Trustless Transactions",
        description:
          "Smart contracts manage all transactions, eliminating the need for intermediaries and providing transparent, verifiable processes that can't be tampered with.",
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
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        ),
      },
      {
        id: 3,
        title: "Continuous Monitoring",
        description:
          "Our security team and automated systems continuously monitor the network for unusual activity, providing real-time threat detection and mitigation.",
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
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        ),
      },
    ],
    
    community: [
      {
        id: 1,
        title: "Decentralized Governance",
        description:
          "Token holders vote on platform decisions and proposals, ensuring true community ownership and democratic development direction.",
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
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        ),
      },
      {
        id: 2,
        title: "Active Community",
        description:
          "Join a vibrant, engaged community of users, developers, and enthusiasts who share knowledge, provide support, and collaborate on platform improvement.",
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        ),
      },
      {
        id: 3,
        title: "Rewards Program",
        description:
          "Earn rewards for community participation, bug reporting, and promoting the platform, creating a self-sustaining ecosystem that benefits all members.",
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
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
    ],
  };

  // Featured item - could be rotated or highlighted
  const featuredItem = {
    title: "Built on Solana Blockchain",
    description:
      "Leveraging Solana's cutting-edge technology, our platform delivers unparalleled speed, security, and scalability, with transactions that cost less than $0.01.",
    benefits: [
      "Up to 65,000 transactions per second",
      "Average transaction cost of $0.00025",
      "Carbon-neutral blockchain operation",
      "Sub-second finality for all transactions",
    ],
    image: "/features/solana-tech.svg", // Placeholder path
  };

  return (
    <section
      id="features"
      className="features-section py-16 md:py-24 bg-gray-900 relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-20">
          {/* Circuit board pattern */}
          <div className="circuit-pattern"></div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-yellow-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-yellow-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <h6 className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-600/10 to-yellow-600/10 text-sm font-medium text-yellow-500 mb-4">
            Why Choose Us
          </h6>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Powerful{" "}
            <span className="text-transparent bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-shadow-glow">
              Features
            </span>{" "}
            & Technology
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-gray-400 text-lg">
            Scythra merges advanced blockchain architecture with intuitive design to deliver a fast, secure, and frictionless financial experience built for the future.
            </p>
          </div>
        </div>

        {/* Featured section */}
        <div className="mb-16">
          <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-yellow-500/30 transition-all duration-300 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left side - Content */}
              <div className="p-8 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                  {featuredItem.title}
                </h3>
                <p className="text-gray-400 mb-6">{featuredItem.description}</p>

                <ul className="space-y-3 mb-8">
                  {featuredItem.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center mt-0.5 mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-300">{benefit}</span>
                    </li>
                  ))}
                </ul>

               
              </div>

              {/* Right side - Image */}
              <div className="featured-image relative h-64 md:h-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 to-emerald-600/20 flex items-center justify-center p-8">
                  {/* Placeholder for image */}
                  <div className="w-full max-w-xs mx-auto">
                    <svg
                      viewBox="0 0 397 311"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-auto"
                    >
                      <path
                        d="M64.5 237.5L98 212.5L333 213L360.5 237.5L333 261.5H98L64.5 237.5Z"
                        fill="#00FFA3"
                      />
                      <path
                        d="M64.5 66.5L98 42.5L333 43L360.5 66.5L333 91.5H98L64.5 66.5Z"
                        fill="#00FFA3"
                      />
                      <path
                        d="M360.5 152L333 128H98L64.5 152L98 176.5H333L360.5 152Z"
                        fill="#00FFA3"
                      />
                    </svg>
                    <p className="text-center text-white font-medium mt-4">
                      Solana Technology
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs navigation */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center mb-8">
            {featureTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 mx-2 my-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-yellow-600 to-yellow-600 text-white shadow-lg"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.title}
              </button>
            ))}
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {features[activeTab].map((feature) => (
              <div
                key={feature.id}
                className="feature-card bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-500/30 transition-all duration-300 group"
              >
                <div className="feature-icon w-16 h-16 mb-6 rounded-lg bg-gradient-to-br from-yellow-600/10 to-yellow-600/10 text-yellow-500 flex items-center justify-center group-hover:from-yellow-600/20 group-hover:to-yellow-600/20 transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-white text-xl font-bold mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-yellow-500 group-hover:to-yellow-500 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gray-800 rounded-xl p-8 border border-gray-700 mt-16">
          <h3 className="text-2xl font-bold text-white mb-3">
          The Future Starts Here. Be Part of It.
          </h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
          The Future of Finance Is Being Built — Own Your Piece of It.
          Early access. Limited supply. Price increases every 5M tokens sold. Secure your SYTR tokens before the next price jump.
          </p>
          <div className="inline-block p-0.5 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-600 shadow-lg">
            <button 
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="bg-gray-900 hover:bg-yellow-800 text-white px-8 py-4 rounded-lg font-medium transition-colors duration-300">
              Get Started Now
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .circuit-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .feature-card {
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px -5px rgb(212,175,55);
        }

        .featured-image {
          position: relative;
        }

        .featured-image:after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(17, 24, 39, 0.8),
            rgba(17, 24, 39, 0.4)
          );
          z-index: -1;
        }
      `}</style>
    </section>
  );
};


export default Features;
