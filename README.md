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
能够启动成功就 Ctrl+C 退出

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

Cross-Program Invocations (CPI): 跨程序调用

Program Derived Addresses (PDA): 程序派生地址

PDA 允许在程序之间调用时使用以编程方式生成的 signatures。
使用 PDA，程序可以被授予对帐户的权限，然后将该权限转移给另一个。
这是可能的，因为程序可以在授予权限的事务中充当 signer。

# 开发
# 测试

# 部署
在部署之前需要获取一些SOL作为燃料
```shell
solana airdrop 5 <你的钱包地址> --url https://devnet.solana.com
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