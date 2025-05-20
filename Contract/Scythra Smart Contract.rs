use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("YourProgramIDReplaceThisWithActualID");

pub const TREASURY_ADDRESS: &str = "FqfoayrRH2NQV46MdnoCAgeUZEdFM9biNdyUdHsCZwkU";
pub const USDC_MINT_ADDRESS: &str = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
pub const SYTR_MINT_ADDRESS: &str = "CxTjB3CVC7uCLB4usDBEbPiHr5vuPeEuXrAbX8vBeRT";

// Constants for tier logic
pub const TOKENS_PER_TIER: u64 = 5_000_000;
pub const TOTAL_TIERS: u64 = 30;
pub const HARD_CAP: u64 = TOKENS_PER_TIER * TOTAL_TIERS; // 150 million tokens
pub const INITIAL_PRICE: u64 = 1; // $0.01 in USDC (6 decimals)
pub const PRICE_INCREASE_BASIS_POINTS: u64 = 2800; // 28% increase
pub const BASIS_POINTS_DIVISOR: u64 = 10000;

#[program]
pub mod presale {
    use super::*;

    pub fn initialize_presale(
        ctx: Context<InitializePresale>,
    ) -> Result<()> {
        let state = &mut ctx.accounts.presale_state;
        let current_time = Clock::get()?.unix_timestamp;

        require!(current_time > 0, PresaleError::InvalidTimestamp);

        state.owner = ctx.accounts.owner.key();
        state.initial_price = INITIAL_PRICE;
        state.start_time = current_time;
        state.total_sold = 0;
        state.active = true;
        state.hard_cap = HARD_CAP;
        state.max_tokens_per_wallet = TOKENS_PER_TIER; // Limit per wallet to one tier
        Ok(())
    }

    pub fn buy_tokens(ctx: Context<BuyTokens>, desired_amount: u64) -> Result<()> {
        let state = &mut ctx.accounts.presale_state;

        require!(state.active, PresaleError::PresaleInactive);
        require!(desired_amount > 0, PresaleError::InvalidAmount);
        require!(desired_amount <= TOKENS_PER_TIER, PresaleError::InvalidAmount);

        let user_purchase = &mut ctx.accounts.user_purchase;

        if user_purchase.amount == 0 {
            user_purchase.buyer = ctx.accounts.buyer.key();
        }

        require!(
            user_purchase.buyer == ctx.accounts.buyer.key(),
            PresaleError::UnauthorizedBuyer
        );

        require!(
            user_purchase.amount + desired_amount <= state.max_tokens_per_wallet,
            PresaleError::WalletLimitExceeded
        );

        require!(
            state.total_sold + desired_amount <= state.hard_cap,
            PresaleError::HardCapExceeded
        );

        // Calculate current tier and price
        let current_tier = state.total_sold / TOKENS_PER_TIER;
        require!(current_tier < TOTAL_TIERS, PresaleError::AllTiersSold);

        let mut current_price = state.initial_price;
        for _ in 0..current_tier {
            current_price = current_price
                .checked_mul(PRICE_INCREASE_BASIS_POINTS)
                .ok_or(PresaleError::MathOverflow)?
                .checked_div(BASIS_POINTS_DIVISOR)
                .ok_or(PresaleError::MathOverflow)?;
        }

        // Calculate total cost
        let total_cost = desired_amount
            .checked_mul(current_price)
            .ok_or(PresaleError::MathOverflow)?;

        // Update state before external calls
        user_purchase.amount = user_purchase.amount
            .checked_add(desired_amount)
            .ok_or(PresaleError::MathOverflow)?;
        state.total_sold = state.total_sold
            .checked_add(desired_amount)
            .ok_or(PresaleError::MathOverflow)?;

        // Transfer USDC to treasury
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.buyer_usdc_account.to_account_info(),
                to: ctx.accounts.treasury_account.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, total_cost)?;

        // Emit event
        emit!(PurchaseEvent {
            buyer: ctx.accounts.buyer.key(),
            amount: desired_amount,
            cost: total_cost,
            tier: current_tier,
            price: current_price,
        });

        Ok(())
    }

    pub fn end_presale(ctx: Context<OnlyOwner>) -> Result<()> {
        ctx.accounts.presale_state.active = false;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePresale<'info> {
    #[account(init, payer = owner, space = 8 + 128)]
    pub presale_state: Account<'info, PresaleState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyTokens<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(mut)]
    pub presale_state: Account<'info, PresaleState>,

    #[account(mut, constraint = buyer_usdc_account.owner == buyer.key())]
    pub buyer_usdc_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub treasury_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,

    #[account(
        init_if_needed,
        payer = buyer,
        space = 8 + 72,
        seeds = [b"user_purchase", buyer.key().as_ref()],
        bump
    )]
    pub user_purchase: Account<'info, UserPurchase>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct OnlyOwner<'info> {
    #[account(mut, has_one = owner)]
    pub presale_state: Account<'info, PresaleState>,
    pub owner: Signer<'info>,
}

#[account]
pub struct PresaleState {
    pub owner: Pubkey,
    pub initial_price: u64,
    pub start_time: i64,
    pub total_sold: u64,
    pub active: bool,
    pub hard_cap: u64,
    pub max_tokens_per_wallet: u64,
}

#[account]
pub struct UserPurchase {
    pub buyer: Pubkey,
    pub amount: u64,
}

#[event]
pub struct PurchaseEvent {
    pub buyer: Pubkey,
    pub amount: u64,
    pub cost: u64,
    pub tier: u64,
    pub price: u64,
}

#[error_code]
pub enum PresaleError {
    #[msg("Presale is not active.")]
    PresaleInactive,
    #[msg("Purchase exceeds wallet limit.")]
    WalletLimitExceeded,
    #[msg("Total tokens sold exceed hard cap.")]
    HardCapExceeded,
    #[msg("Math overflow occurred.")]
    MathOverflow,
    #[msg("Buyer is not authorized.")]
    UnauthorizedBuyer,
    #[msg("Invalid amount specified.")]
    InvalidAmount,
    #[msg("Invalid timestamp provided.")]
    InvalidTimestamp,
    #[msg("All tiers have been sold.")]
    AllTiersSold,
}
