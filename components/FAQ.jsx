// components/FAQ.jsx

import React, { useState } from 'react';


const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="faq-container">
      <div className="faq-content">
      <h2 className="faq-title" style={{ color: '#FFD700' }}>
  Frequently Asked Questions
</h2>

        
        <div className="question" onClick={() => toggleAccordion(0)}>
          <div className="question-header">
            <h3>When will I receive my SYTR tokens?</h3>
            <span className={`accordion-icon ${activeIndex === 0 ? 'active' : ''}`}>+</span>
          </div>
          {activeIndex === 0 && (
            <div className="question-body">
              <p>
              ➡️ Your SYTR tokens will be unlocked and automatically distributed 6 months after the pre-sale ends. No action needed — your tokens are secured based on your on-chain purchase.
              </p>
            </div>
          )}
        </div>
        
        <div className="question" onClick={() => toggleAccordion(1)}>
          <div className="question-header">
            <h3>How does the price increase during the pre-sale?</h3>
            <span className={`accordion-icon ${activeIndex === 1 ? 'active' : ''}`}>+</span>
          </div>
          {activeIndex === 1 && (
            <div className="question-body">
              <p>
              ➡️ The price jumps 28% after every 5 million tokens sold. 💥 The earlier you buy, the cheaper your price — don’t miss your spot.
              </p>
            </div>
          )}
        </div>
        
        <div className="question" onClick={() => toggleAccordion(2)}>
          <div className="question-header">
            <h3>What is the maximum amount I can buy?</h3>
            <span className={`accordion-icon ${activeIndex === 2 ? 'active' : ''}`}>+</span>
          </div>
          {activeIndex === 2 && (
            <div className="question-body">
              <p>
              ➡️ Each wallet can purchase up to 300,000 SYTR tokens. 🛡️ Maximize your allocation before the cap is reached.
                          </p>
            </div>
          )}
        </div>

        <div className="question" onClick={() => toggleAccordion(3)}>
          <div className="question-header">
            <h3>How can I participate in the pre-sale?</h3>
            <span className={`accordion-icon ${activeIndex === 3 ? 'active' : ''}`}>+</span>
          </div>
          {activeIndex === 3 && (
            <div className="question-body">
              <p>
              ➡️ Connect your Solana wallet (like Phantom) directly on our platform and buy SYTR instantly — it’s fast, secure, and direct.
              </p>
            </div>
          )}
        </div>

        <div className="question" onClick={() => toggleAccordion(4)}>
          <div className="question-header">
            <h3>Which wallet can I use to buy SYTR?</h3>
            <span className={`accordion-icon ${activeIndex === 4 ? 'active' : ''}`}>+</span>
          </div>
          {activeIndex === 4 && (
            <div className="question-body">
              <p>
              ➡️ Supported wallets include Phantom, Solflare, Backpack, and any major Solana wallets.
              </p>
            </div>
          )}
        </div>

        <div className="question" onClick={() => toggleAccordion(5)}>
          <div className="question-header">
            <h3>What currency do I need to buy SYTR?</h3>
            <span className={`accordion-icon ${activeIndex === 5 ? 'active' : ''}`}>+</span>
          </div>
          {activeIndex === 5 && (
            <div className="question-body">
              <p>
              ➡️ You must use USDC on the Solana network to buy SYTR. Tip: Make sure you have some USDC in your wallet too to cover tiny network fees.
              </p>
            </div>
          )}
        </div>

        <div className="question" onClick={() => toggleAccordion(6)}>
          <div className="question-header">
            <h3>Is there a hard cap for the pre-sale?</h3>
            <span className={`accordion-icon ${activeIndex === 6 ? 'active' : ''}`}>+</span>
          </div>
          {activeIndex === 6 && (
            <div className="question-body">
              <p>
              ➡️ Yes — only 150 million SYTR are available. 🔥 Once they’re gone, they’re gone. Secure yours early.
              </p>
            </div>
          )}
        </div>
        
        {/* Add more FAQs as needed */}
        
      </div>
      
      <style jsx>{`
        .faq-container {
          background-color: #14182b; /* Dark blue background color */
          color: white;
          padding: 50px;
        }

        .faq-content {
          max-width: 800px;
          margin: 0 auto;
          text-align: left;
        }

        .faq-title {
          text-align: center;
          color: #fff;
          font-size: 36px;
          margin-bottom: 30px;
        }

        .question {
          background-color: #d1e3fc; /* Light blue for the dropdown container */
          margin-bottom: 15px;
          padding: 15px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .question-header h3 {
          color: black;
          font-size: 20px;
        }

        .accordion-icon {
          font-size: 24px;
          font-weight: bold;
          color: black;
          transition: transform 0.3s ease;
        }

        .accordion-icon.active {
          transform: rotate(45deg);
        }

        .question-body {
          padding-top: 10px;
          color: black;
        }

        .question-body p {
          font-size: 16px;
          line-height: 1.5;
        }

        .question:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </section>
  );
};

export default FAQ;
