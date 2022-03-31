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


