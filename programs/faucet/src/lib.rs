use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;
use anchor_spl::token::{self, MintTo};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod faucet {
    use super::*;

    pub fn initialize(ctx: Context<InitializeFaucet>, drip_volume: u64) -> Result<()> {
        let faucet_config = &mut ctx.accounts.faucet_config;
        faucet_config.drip_volume = drip_volume;
        Ok(())
    }

    pub fn drip(ctx: Context<Drip>) -> ProgramResult {
        let faucet_config = ctx.accounts.faucet_config.clone();
        let seeds = &[
            faucet_config.to_account_info().key.as_ref(),
            &[faucet_config.nonce],
        ];
        let signer_seeds = &[&seeds[..]];
        let cpi_accounts = MintTo {
            mint: ctx.accounts.token_mint.to_account_info(),
            to: ctx.accounts.receiver.to_account_info(),
            authority: ctx.accounts.token_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.clone();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        token::mint_to(cpi_ctx, faucet_config.drip_volume)?;
        Ok(())
    }
}

#[account] // 宏：序列化和反序列化
pub struct FaucetConfig {
    pub authority: Pubkey,
    pub drip_volume: u64, // 水滴体积（水龙头一次给多少币）
}

#[derive(Accounts)] // Programs 对应的账户
pub struct InitializeFaucet<'info> {
    #[account(init, payer = user, space = 8 + 40)]
    pub faucet_config: Account<'info, FaucetConfig>, // 新 account 需要初始化数据
    #[account(mut)]
    pub user: Signer<'info>, //让 Program能够把数据持久化到 account.data 中
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Drip<'info> {
    #[account(mut, has_one=authority)]
    faucet_config: Account<'info, FaucetConfig>,
    authority: Signer<'info>,
}
