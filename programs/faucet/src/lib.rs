use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;
use anchor_spl::{token::{self, MintTo, Token}};

declare_id!("pNZo25EcxWvfwPXVVnzPaszBsFNpit1N7ErAcL7w8Bw");


#[program]
pub mod faucet {
    use super::*;

    pub fn initialize(ctx: Context<InitializeFaucet>, nonce: u8, drip_volume: u64) -> Result<()> {
        let faucet_config = &mut ctx.accounts.faucet_config;
        faucet_config.token_program = *ctx.accounts.token_program.key;
        faucet_config.token_mint = *ctx.accounts.token_mint.key;
        faucet_config.token_authority = *ctx.accounts.token_authority.key;
        faucet_config.authority = *ctx.accounts.user.key;
        faucet_config.nonce = nonce;
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
        anchor_spl::token::mint_to(cpi_ctx, faucet_config.drip_volume)?;
        Ok(())
    }

    pub fn set_drip_volume(ctx: Context<Increment>, drip_volume: u64) -> Result<()> {
        let faucet_config = &mut ctx.accounts.faucet_config;
        faucet_config.drip_volume = drip_volume;
        Ok(())
    }
}

#[account] // 宏：序列化和反序列化
pub struct FaucetConfig {
    pub token_program: Pubkey,   // 一个 Solana Program 的公钥
    pub token_mint: Pubkey,      // Program 的 Account 地址，其中存储了 Token 的信息
    pub token_authority: Pubkey, // Program 的授权
    pub nonce: u8,               // 随机数，跟着授权走
    pub authority: Pubkey,
    pub drip_volume: u64,        // 水滴体积（水龙头一次给多少币）
}

#[derive(Accounts)]
pub struct InitializeFaucet<'info> {
    #[account(init, payer = user, space = 8 + 8 + 8*1000)]
    pub faucet_config: Account<'info, FaucetConfig>, // 新 account 需要初始化数据
    pub token_program: Program<'info, Token>,
    /// CHECK:
    #[account(mut)]
    pub token_mint: AccountInfo<'info>, //让 Program能够把数据持久化到 account.data 中
    /// CHECK:
    #[account()]
    pub token_authority: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>, // 租金

    #[account(mut)]
    pub user: Signer<'info>, //谁部署 Program
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut, has_one = authority)]
    pub faucet_config: Account<'info, FaucetConfig>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct Drip<'info> {
    #[account()]
    pub faucet_config: Account<'info, FaucetConfig>,
    /// CHECK:
    #[account(constraint = token_program.key == &token::ID)]
    pub token_program: AccountInfo<'info>,
    /// CHECK:
    #[account(mut, constraint = &faucet_config.token_mint == token_mint.key)]
    pub token_mint: AccountInfo<'info>,
    /// CHECK:
    #[account(constraint = &faucet_config.token_authority == token_authority.key)]
    pub token_authority: AccountInfo<'info>,
    /// CHECK:
    #[account(mut)]
    pub receiver: AccountInfo<'info>,
}
