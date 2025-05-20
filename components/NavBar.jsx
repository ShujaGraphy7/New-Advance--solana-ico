import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import WalletMultiButton with SSR disabled
const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    {
      title: "Home",
      path: "#home",
      isScrollspy: true,
    },
    { title: "Roadmap", path: "#roadmap", isScrollspy: true },
    { title: "Tokenomics", path: "#token", isScrollspy: true},
    { title: "Features", path: "#features", isScrollspy: true },
    { title: "About", path: "#about", isScrollspy: true },
    { title: "FAQ", path: "#faq", isScrollspy: true },
    { title: "Scythra Apps", path: "#scythraapps", isScrollspy: true },
  ];

  const handleScrollspy = (e, id) => {
    e.preventDefault();
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="header-area">
    <div
      className={`xb-header ${isSticky ? "sticky" : ""} bg-gray-900 border-b border-gray-800`}
      style={{
        backdropFilter: isSticky ? "blur(10px)" : "none",
        backgroundColor: isSticky ? "rgba(17, 24, 39, 0.85)" : "rgb(17, 24, 39)",
      }}
    >
        <div className="container mx-auto">
          <div className="header__wrap ul_li_between flex items-center justify-between py-4 px-4">
            <div className="header-logo">
              <Link href="/">
                <div className="flex items-center">
                  <Image
                    src="/partners\Scythra-removebg-preview.png"
                    alt="Scythra"
                    width={70}
                    height={40}
                    priority
                  />
                  <Image
                    src="/partners\Coin_Symbol1.png"
                    alt="Scythra"
                    width={70}
                    height={40}
                    priority
                  />
                  <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-shadow-glow">
  Born to Break Barriers
</span>

<style jsx>{`
  .text-shadow-glow {
    text-shadow: 0 0 5px rgba(255, 223, 0, 0.8), 
                 0 0 10px rgba(255, 223, 0, 0.6), 
                 0 0 15px rgba(255, 223, 0, 0.4);
  }
`}</style>

                </div>
              </Link>
            </div>

            <div className="main-menu__wrap ul_li navbar navbar-expand-lg hidden lg:block">
              <nav className={`main-menu ${isMobileMenuOpen ? "show" : ""}`}>
                <ul className="flex space-x-8">
                  {menuItems.map((item, index) => (
                    <li key={index} className="relative group">
                      {item.isScrollspy ? (
                        <a
                          href={item.path}
                          className="scrollspy-btn text-gray-300 hover:text-navy transition-colors duration-300 py-2 px-1 font-medium"
                          onClick={(e) => handleScrollspy(e, item.path)}
                        >
                          <span>{item.title}</span>
                          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-500 to-yellow-500 transition-all duration-300 group-hover:w-full"></span>
                        </a>
                      ) : (
                        <Link
                          href={item.path}
                          className="text-gray-300 hover:text-navy transition-colors duration-300 py-2 px-1 font-medium"
                        >
                          <span>{item.title}</span>
                          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-500 to-yellow-500 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="header-btn ul_li flex items-center space-x-4">
              {mounted && (
                <div className="wallet-button-wrapper">
                  <WalletMultiButton className="wallet-button" />
                  <style jsx>{`
                    :global(.wallet-adapter-button) {
                      background: linear-gradient(
                        to right,
                        rgb(255, 223, 0),
                        rgb(212, 175, 55)
                      ) !important;
                      transition: all 0.3s ease;
                      border-radius: 0.5rem !important;
                      padding: 0.75rem 1.25rem !important;
                    }
                    :global(.wallet-adapter-button:hover) {
                      background: linear-gradient(
                        to right,
                        rgb(255, 223, 0),
                        rgb(212, 175, 55)
                      ) !important;
                      transform: translateY(-2px);
                      box-shadow: 0 8px 20px rgb(255, 223, 0);
                    }
                    :global(.wallet-adapter-button-trigger) {
                      background: linear-gradient(
                        to right,
                        rgb(255, 223, 0),
                        rgb(212, 175, 55)
                      ) !important;
                    }
                  `}</style>
                </div>
              )}
              <div className="header-bar-mobile lg:hidden">
                <button
                  className="xb-nav-mobile text-white p-2 focus:outline-none"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Toggle mobile menu"
                >
                  {isMobileMenuOpen ? (
                    <svg
                      className="w-6 h-6 text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6 text-black"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu bg-gray-900 overflow-hidden transition-all duration-500 lg:hidden">
          <div className="container mx-auto px-4 py-4">
            <ul className="flex flex-col space-y-4">
              {menuItems.map((item, index) => (
                <li key={index} className="border-b border-gray-800 pb-2">
                  {item.isScrollspy ? (
                    <a
                      href={item.path}
                      className="scrollspy-btn text-gray-300 hover:text-yellow-500 transition-colors duration-300 block py-2"
                      onClick={(e) => handleScrollspy(e, item.path)}
                    >
                      <span>{item.title}</span>
                    </a>
                  ) : (
                    <Link
                      href={item.path}
                      className="text-gray-300 hover:text-yellow-500 transition-colors duration-300 block py-2"
                    >
                      <span>{item.title}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
