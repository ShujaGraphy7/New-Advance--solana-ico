import React from "react";
import Image from "next/image";

const Partners = () => {
  // Sample partner data - replace with your actual partners
  const partners = [
    {
      id: 1,
      name: "Solana",

      description: "High-performance blockchain",
      website: "https://solana.com",
    },
    {
      id: 2,
      name: "Binance",

      description: "Leading cryptocurrency exchange",
      website: "https://binance.com",
    },
    {
      id: 3,
      name: "Coinbase",

      description: "Trusted crypto platform",
      website: "https://coinbase.com",
    },
    {
      id: 4,
      name: "Phantom",

      description: "Popular Solana wallet",
      website: "https://phantom.app",
    },
    {
      id: 5,
      name: "Serum",

      description: "Decentralized exchange protocol",
      website: "https://projectserum.com",
    },
    {
      id: 6,
      name: "MetaPlex",

      description: "NFT infrastructure",
      website: "https://metaplex.com",
    },
  ];

  return (
    <section
      id="partners"
      className="partners-section bg-gray-900 py-16 md:py-24"
    >
      <div className="container mx-auto px-4">
        {/* Section title */}
        <div className="text-center mb-16">
          <h6 className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-600/10 to-yellow-600/10 text-sm font-medium text-yellow-500 mb-4">
            Our Network
          </h6>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Strategic{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-500">
              Partners
            </span>
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-gray-400 text-lg">
              We're backed by industry leaders who believe in our vision to
              revolutionize blockchain technology.
            </p>
          </div>
        </div>

        {/* Partners grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          {partners.map((partner) => (
            <a
              key={partner.id}
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              className="partner-card group"
            >
              <div className="partner-card-inner relative h-40 flex flex-col items-center justify-center rounded-xl bg-gray-800 border border-gray-700 hover:border-yellow-500/50 transition-all duration-300 p-6 overflow-hidden">
                {/* Logo placeholder - replace with actual Image component when logos are available */}
                <div className="relative h-16 w-16 mb-4 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 to-yellow-600/10 rounded-full group-hover:opacity-100 opacity-0 transition-opacity duration-300"></div>
                  <div className="relative h-12 w-12 flex items-center justify-center bg-gray-700 rounded-full">
                    {/* This would be replaced with actual logo */}
                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-500">
                      {partner.name.charAt(0)}
                    </div>
                  </div>
                </div>
                <h3 className="text-white text-center font-medium mb-1 group-hover:text-yellow-400 transition-colors duration-300">
                  {partner.name}
                </h3>

                {/* Hover info effect */}
                <div className="absolute inset-0 bg-gray-800/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="text-center p-4">
                    <h3 className="text-lg font-medium text-white mb-2">
                      {partner.name}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {partner.description}
                    </p>
                    <span className="inline-block mt-3 text-xs text-yellow-400 border-b border-yellow-400">
                      Visit Website
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

            </div>

      {/* Background elements */}
      <div className="absolute top-40 left-0 w-full overflow-hidden -z-10 opacity-20">
        <div className="orbital-circle circle-1"></div>
        <div className="orbital-circle circle-2"></div>
      </div>

      <style jsx>{`
        .orbital-circle {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgb(255, 215, 0);
        }

        .circle-1 {
          width: 500px;
          height: 500px;
          top: -250px;
          left: 10%;
          border-color: rgb(218, 165, 32);
        }

        .circle-2 {
          width: 300px;
          height: 300px;
          top: 100px;
          right: 10%;
        }

        .partners-section {
          position: relative;
          overflow: hidden;
        }

        .partner-card:hover .partner-card-inner {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px -5px rgb(212, 175, 55);
        }
      `}</style>
    </section>
  );
};

export default Partners;
