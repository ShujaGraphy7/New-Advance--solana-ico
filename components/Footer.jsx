import React from "react";
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  // Current year for copyright
  const currentYear = new Date().getFullYear();

  // Footer navigation links
  const footerLinks = [
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/#about" },        
       ],
    },
    {
      title: "Platform",
      links: [
        { name: "Token Sale", href: "#herosection" },
        { name: "Roadmap", href: "#roadmap" },
        { name: "Features", href: "#features" },
        { name: "Whitepaper", href: "/partners/whitepaper.pdf" },
             ],
    },
    {
      title: "Resources",
      links: [
              { name: "FAQs", href: "#faq" },
               { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
      ],
    },
  ];

  // Social media links
  const socialLinks = [
    {
      name: "Twitter",
      href: "https://twitter.com/scythraofficial",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
    },
    {
  name: "Instagram",
  href: "https://instagram.com/scythra.official",
  icon: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M7.75 2A5.75 5.75 0 002 7.75v8.5A5.75 5.75 0 007.75 22h8.5A5.75 5.75 0 0022 16.25v-8.5A5.75 5.75 0 0016.25 2h-8.5zm0 1.5h8.5A4.25 4.25 0 0120.5 7.75v8.5a4.25 4.25 0 01-4.25 4.25h-8.5A4.25 4.25 0 013.5 16.25v-8.5A4.25 4.25 0 017.75 3.5zm4.25 3.25a5 5 0 100 10 5 5 0 000-10zm0 1.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7zm4.5-.75a.75.75 0 100 1.5.75.75 0 000-1.5z" />
    </svg>
  ),
},
     {
      name: "TikTok",
      href: "https://www.tiktok.com/@scythra.official",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M16 8.245v1.398c.755.364 1.58.618 2.451.729v2.117a6.99 6.99 0 01-2.454-.507v4.07c0 3.311-2.69 5.998-6 5.998s-6-2.687-6-5.998c0-3.312 2.69-6 6-6 .342 0 .675.03 1 .086v2.128A3.99 3.99 0 008 16c0 1.102.899 2 2 2s2-.898 2-2v-9.998h2c.003.773.319 1.464.832 1.952a3.92 3.92 0 001.168.696z" />
        </svg>
      ),
    },
    {
      name: "Medium",
      href: "https://medium.com/@scythraofficial",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="footer-section bg-gray-900 pt-16 border-t border-gray-800">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12">
        {/* Logo and info */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center">
              <div className="flex items-center">
                {/* Logo 1 - Scythra-removebg-preview */}
                <img
                  src="/partners/Scythra-removebg-preview.png"
                  alt="Scythra"
                  className="w-18 h-10"
                  style={{ objectFit: 'contain' }}
                />
                {/* Logo 2 - Coin_Symbol1 */}
                <img
                  src="/partners/Coin_Symbol1.png"
                  alt="Scythra"
                  className="w-18 h-10"
                  style={{ objectFit: 'contain' }}
                />
                {/* Text */}
                <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-shadow-glow">
                  Born to Break Barriers
                </span>
                </div>
              </Link>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
  A new force is rising. <span className="font-bold text-lg">Scarce. Fast. Unstoppable.</span><br />
  Scythra isn't here to play by the old rules — it's rewriting them.<br />
  <span className="font-bold text-lg">No noise. No hype. Just raw momentum.</span><br />
  Discover Scythra. Own what's next.
</p>


           

            {/* Social links */}
            <div>
              <h4 className="text-white font-medium mb-3">
                Join Our Community & Follow For More Updates
              </h4>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gradient-to-r hover:from-yellow-600 hover:to-yellow-600 hover:text-white transition-all duration-300"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

         {/* Navigation links */}
{footerLinks.map((category) => (
  <div key={category.title}>
    <h4 className="text-white font-medium mb-4">{category.title}</h4>
    <ul className="space-y-2">
      {category.links.map((link) => (
        <li key={link.name}>
          <Link
            href={link.href}
            className="text-gray-400 hover:text-yellow-400 transition-colors duration-300"
            target={link.name === "Whitepaper" ? "_blank" : "_self"} // Ensure Whitepaper opens in a new tab
            rel="noopener noreferrer" // Security for opening new tabs
          >
            {link.name}
          </Link>
        </li>
      ))}
    </ul>
  </div>
))}
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {currentYear} Scythra. All rights reserved.
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-yellow-400 transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-yellow-400 transition-colors duration-300"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-gray-400 hover:text-yellow-400 transition-colors duration-300"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Background gradient */}
      <div className="relative h-2 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-yellow-600 to-yellow-600 animate-gradient-x"></div>
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
