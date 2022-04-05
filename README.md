# Solana Faucet
Solana 水龙头

# Environment

## Rust
```shell
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup component add rustfmt
```
## Solana
```shell
sh -c "$(curl -sSfL https://release.solana.com/v1.9.1/install)"
```
按照安装成功的提示，把路径加入环境变量。

第一次运行本地网前，先创建钱包
```shell
solana-keygen new
```
然后启动本地网
```shell
solana-test-validator
```
能够启动成功就 Ctrl+C 退出。

查看你的钱包地址：
```shell
solana config get keypair
solana address
# 下面你的地址 <address> 代表 CraxTNhNEXGcKdfA64hGjD7KUzdTCEpzugvxLyYZsvDQ
```
申请空投，白嫖一点 SOL 用于开发：
```shell
solana airdrop 100 <address> --url https://api.devnet.solana.com
```
查看钱包余额：
```shell
solana balance
# or
solana balance <address>
```
## Nodejs, npm, yarn
```shell
curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n
bash n lts
# Now node and npm are available
npm install -u n
npm install -u yarn
```
## Anchor
```shell
npm i -u @project-serum/anchor-cli
```
## 初始化项目
```shell
anchor init faucet
cd faucet
```

# 前置知识

1. Cross-Program Invocations (CPI): 跨程序调用。

2. Program Derived Addresses (PDA): 程序派生地址。
    PDA 允许在程序之间调用时使用以编程方式生成的 signatures。
    使用 PDA，程序可以被授予对帐户的权限，然后将该权限转移给另一个。
    这是可能的，因为程序可以在授予权限的事务中充当 signer。

3. Solana Program Library (SPL): Solana 程序库。
    SPL 是针对 Sealevel 并行运行时的链上程序的集合。

# 开发

水龙头的逻辑：
1. 开发完成后部署到链上，自动执行 init
2. 用户调用 drip，附上币种
3. 给用户发币，发币量由水龙头初始化时被指定

# 测试

`anchor test` 命令会自动拉起一个随机的本地网并在上面部署测试一条龙，这时候你不能再手动挂着另一个本地网了。如果你需要手动挂着一个本地网也行，使用 `anchor test --skip-local-validator`。

# 部署

部署到链上需要一些 SOL 做委托费。需要获取一些 SOL：
```shell
solana airdrop 5 <你的钱包地址> --url https://api.devnet.solana.com
```
然后就可以通过以下指令部署到开发网络
```shell
npm run deploy:devnet
```
部署完成之后可以看到控制台输出
```shell
Program Id: <program-id>

Deploy success
```

# BUG 记录

## 非程序 BUG
Q: Unable to get recent blockhash. Test validator does not look started
A:
```
# ./Anchor.toml
[test]
startup_wait = 100000
```

Q: Unable to start test validator. Check .anchor/test-ledger/test-ledger-log.txt for errors.
A:
```
# ./Anchor.toml
[test]
startup_wait = 100000
```

Q:
```shell
# linxueyuan @ CAD-GPU96 in ~/github/SolanaFaucet on git:main x [0:11:49]
$ anchor deploy --provider.cluster https://api.devnet.solana.com
Deploying workspace: https://api.devnet.solana.com
Upgrade authority: /home/linxueyuan/.config/solana/id.json
Deploying program "faucet"...
Program path: /home/linxueyuan/github/SolanaFaucet/target/deploy/faucet.so...
=========================================================================
Recover the intermediate account's ephemeral keypair file with
`solana-keygen recover` and the following 12-word seed phrase:
=========================================================================
limit shop view hockey weapon strike truth base maple goddess excuse blue
=========================================================================
To resume a deploy, pass the recovered keypair as the
[BUFFER_SIGNER] to `solana program deploy` or `solana write-buffer'.
Or to recover the account's lamports, pass it as the
[BUFFER_ACCOUNT_ADDRESS] argument to `solana program close`.
=========================================================================
Error: Account 8E711PRVdEcUnccz88TGFardCKTBE1oCPk2J16rpB4Wq has insufficient funds for spend (2.56448856 SOL) + fee (0.00184 SOL)
There was a problem deploying: Output { status: ExitStatus(unix_wait_status(256)), stdout: "", stderr: "" }.
```
A: 先白嫖一点 SOL
```
solana airdrop 5 --url https://api.devnet.solana.com
```
白嫖的时候不要一次嫖太多，否则会被拒绝白嫖，拒绝交易，出现 `Balance unchanged`：
```shell
# linxueyuan @ CAD-GPU96 in ~/github/SolanaFaucet on git:main x [0:22:17]
$ solana airdrop 5
Requesting airdrop of 5 SOL

Signature: 4HQ9tB5kqM1u7AhW6h6THt5vKuRRYndKLvuArDqukL1mcbHD1V9YhtQAYi8VyZZSmNiJbDRLL7X3H4TJRwyHxQtf

Balance unchanged
Run `solana confirm -v 4HQ9tB5kqM1u7AhW6h6THt5vKuRRYndKLvuArDqukL1mcbHD1V9YhtQAYi8VyZZSmNiJbDRLL7X3H4TJRwyHxQtf` for more info

(base)
# linxueyuan @ CAD-GPU96 in ~/github/SolanaFaucet on git:main x [0:22:44]
$ solana confirm -v 4HQ9tB5kqM1u7AhW6h6THt5vKuRRYndKLvuArDqukL1mcbHD1V9YhtQAYi8VyZZSmNiJbDRLL7X3H4TJRwyHxQtf
RPC URL: https://api.devnet.solana.com
Default Signer Path: /home/linxueyuan/.config/solana/id.json
Commitment: confirmed

Transaction executed in slot 125754582:
  Block Time: 2022-04-05T00:22:42+08:00
  Version: legacy
  Recent Blockhash: 5SnbgToao4BANxS5ygPRi8G29oV96cgKZyZ3M5DLmgfG
  Signature 0: 4HQ9tB5kqM1u7AhW6h6THt5vKuRRYndKLvuArDqukL1mcbHD1V9YhtQAYi8VyZZSmNiJbDRLL7X3H4TJRwyHxQtf
  Account 0: srw- 9B5XszUGdMaxCZ7uSQhPzdks5ZQSmWxrmzCSvtJ6Ns6g (fee payer)
  Account 1: -r-x MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr
  Instruction 0
    Program:   MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr (1)
    Data: "request too large; req: ◎5, cap: ◎2"
  Status: Ok
    Fee: ◎0.000005
    Account 0 balance: ◎18256078.68313557 -> ◎18256078.68313057
    Account 1 balance: ◎0.52149888
  Log Messages:
    Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr invoke [1]
    Program log: Memo (len 39): "request too large; req: ◎5, cap: ◎2"
    Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr consumed 32814 of 200000 compute units
    Program MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr success

Confirmed
```
白嫖成功是这样：
```shell
# linxueyuan @ CAD-GPU96 in ~/github/SolanaFaucet on git:main x [0:22:54]
$ solana airdrop 1
Requesting airdrop of 1 SOL

Signature: 2XenhjmJamWoL5BsYqJ3qrEJayBtAos5pvv6RBvqTDP8bHWcVp8akVgip7ZjBEW3YaGDKDmxjsXsRsAni6shBDhw

1 SOL
(base)
# linxueyuan @ CAD-GPU96 in ~/github/SolanaFaucet on git:main x [0:23:21]
$ solana airdrop 1
Requesting airdrop of 1 SOL

Signature: 29g3pMfWcArKprUD2v3nX1noqeuj3Vi6bjedh6rftcv1eYCxH2qwNV6kx9p6gwQVU1UCrHSe9qZigjpxJK1u8mZz

2 SOL
```

Q:
```shell
# linxueyuan @ CAD-GPU96 in ~/github/SolanaFaucet on git:main x [0:13:39]
$ solana config get
Config File: /home/linxueyuan/.config/solana/cli/config.yml
RPC URL: https://api.mainnet-beta.solana.com
WebSocket URL: wss://api.mainnet-beta.solana.com/ (computed)
Keypair Path: /home/linxueyuan/.config/solana/id.json
Commitment: confirmed
```
A: WebSocket URL 应该为开发网络才对。
```shell
# linxueyuan @ CAD-GPU96 in ~/github/SolanaFaucet on git:main x [0:14:34]
$ solana config set --url https://api.devnet.solana.com
Config File: /home/linxueyuan/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /home/linxueyuan/.config/solana/id.json
Commitment: confirmed
(base)
```
## 程序 BUG
Q: account Address already in use
```shell
Transaction simulation failed: Error processing Instruction 1: custom program error: 0x0
    Program 11111111111111111111111111111111 invoke [1]
    Program 11111111111111111111111111111111 success
    Program Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS invoke [1]
    Program log: Instruction: Initialize
    Program 11111111111111111111111111111111 invoke [2]
    Allocate: account Address { address: 44wYWpP8pvo6teJVqu8nUbgR5duVrxcbcD8TeTGs1CC4, base: None } already in use
    Program 11111111111111111111111111111111 failed: custom program error: 0x0
    Program Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS consumed 5476 of 1400000 compute units
    Program Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS failed: custom program error: 0x0
```
A: space设置得大一点 `#[account(init, payer = user, space = 8 + 8 + 8*1000)]`

