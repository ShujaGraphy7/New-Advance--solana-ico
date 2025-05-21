# Scythra Presale Contract

A secure and optimized Solana presale contract built with Anchor framework.

## Features

- Tiered token sale with dynamic pricing
- Secure token transfers using SPL Token program
- PDA-based state management
- Comprehensive error handling
- Event emission for tracking
- Wallet purchase limits
- Hard cap implementation

## Prerequisites

- Rust 1.70.0 or later
- Solana CLI tools
- Anchor Framework
- Node.js 16.x or later
- Yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd scythra_presale
```

2. Install dependencies:
```bash
yarn install
```

3. Build the program:
```bash
anchor build
```

## Testing

Run the test suite:
```bash
anchor test
```

## Deployment

1. Update the program ID in `lib.rs` with your deployed program ID
2. Deploy the program:
```bash
anchor deploy
```

## Contract Structure

### State Accounts

- `PresaleState`: Main state account containing presale configuration and status
- `UserPurchase`: Per-user purchase tracking account

### Instructions

1. `initialize_presale`: Initialize the presale with configuration
2. `buy_tokens`: Purchase tokens during the presale
3. `end_presale`: End the presale (owner only)

### Security Features

- PDA-based state management
- Comprehensive input validation
- Safe math operations
- Owner-only administrative functions
- Token account ownership verification
- Purchase limits per wallet

## License

MIT 