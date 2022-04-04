import { BN, getProvider, web3, workspace } from "@project-serum/anchor";
import {
  createMint,
  createTokenAccountInstrs,
  getMintInfo,
  getTokenAccount,
} from "@project-serum/common";
import { TokenInstructions } from "@project-serum/serum";
import assert from "assert";
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
const { SystemProgram } = anchor.web3;
import { PublicKey } from '@solana/web3.js';
const { TOKEN_PROGRAM_ID, Token, ASSOCIATED_TOKEN_PROGRAM_ID } = require("@solana/spl-token");
import { Faucet } from '../target/types/faucet';

// describe("Foucet", () => {
//   const provider = anchor.Provider.local();

//   // Configure the client to use the local cluster.
//   anchor.setProvider(provider);

//   // Counter for the tests.
//   const counter = anchor.web3.Keypair.generate();

//   // Program for the tests.
//   const program = anchor.workspace.Faucet as Program<Faucet>;

//   const testTokenDecimals = 6;
//   const dripVolume: BN = new BN(10 ** testTokenDecimals);
//   const dripVolume_next: BN = new BN(10 ** testTokenDecimals + 1);

//   it("Creates a counter", async () => {
//     await program.rpc.create(provider.wallet.publicKey, dripVolume, {
//       accounts: {
//         counter: counter.publicKey,
//         user: provider.wallet.publicKey,
//         systemProgram: SystemProgram.programId,
//       },
//       signers: [counter],
//     });

//     let counterAccount = await program.account.counter.fetch(counter.publicKey);

//     assert.ok(counterAccount.authority.equals(provider.wallet.publicKey));
//     assert.ok(counterAccount.dripVolume.toNumber() === dripVolume.toNumber());
//   });

//   it("Updates a counter", async () => {
//     await program.rpc.setDripVolume(dripVolume_next, {
//       accounts: {
//         counter: counter.publicKey,
//         authority: provider.wallet.publicKey,
//       },
//     });

//     const counterAccount = await program.account.counter.fetch(counter.publicKey);

//     assert.ok(counterAccount.authority.equals(provider.wallet.publicKey));
//     assert.ok(counterAccount.dripVolume.toNumber() == dripVolume_next.toNumber());
//   });

//   async function airdropTokens(amount, mintPda, mintPdaBump, receiver, associatedTokenAccount) {
//     let amountToAirdrop = new anchor.BN(amount * 1000000);
//     await program.rpc.airdrop(
//       mintPdaBump,
//       amountToAirdrop,
//       {
//         accounts: {
//           payer: program.provider.wallet.publicKey,
//           mint: mintPda,
//           destination: associatedTokenAccount,
//           receiver: receiver,
//           rent: anchor.web3.SYSVAR_RENT_PUBKEY,
//           tokenProgram: TOKEN_PROGRAM_ID,
//           systemProgram: SystemProgram.programId,
//           associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
//         },
//         signers: [],
//       }
//     );
//   }

//   async function getBalance(receiver, mintPda) {
//      const parsedTokenAccountsByOwner = await program.provider.connection.getParsedTokenAccountsByOwner(receiver, { mint: mintPda });
//      let balance = parsedTokenAccountsByOwner.value[0].account.data.parsed.info.tokenAmount.uiAmount;
//      return balance;
//   }

//   // it("Airdrop",async () => {
//   //   await program.rpc.airdrop(
//   //   )
//   // });
//   it('Airdrop tokens 2 times and check token account', async () => {
//     // Get the PDA that is the mint for the faucet
//     const [mintPda, mintPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
//       [Buffer.from(anchor.utils.bytes.utf8.encode("faucet-mint"))],
//       program.programId);

//     // const receiver = new PublicKey("8hpvAu6cq6qzVM4NpXp9bH2uuT4PEYMJvrXKrSd5tdfR");
//     // const receiver = anchor.web3.Keypair.generate().publicKey;
//     const receiver = program.provider.wallet.publicKey;

//     let associatedTokenAccount = await Token.getAssociatedTokenAddress(
//       ASSOCIATED_TOKEN_PROGRAM_ID,
//       TOKEN_PROGRAM_ID,
//       mintPda,
//       receiver,
//       true
//     );

//     console.log("Program ID: ", program.programId.toBase58());
//     console.log("mintPda: ", mintPda.toBase58());
//     console.log("mintPdaBump: ", mintPdaBump);
//     console.log("program.provider", program.provider.wallet.publicKey.toBase58());
//     console.log("receiver", receiver.toBase58());

//     //get balance
//     // let init_balance = await getBalance(receiver, mintPda);
//     // console.log("init balance", init_balance);

//     // FIRST AIRDROP
//     const firstAirdropAmount = 100;
//     await airdropTokens(firstAirdropAmount, mintPda, mintPdaBump, receiver, associatedTokenAccount);
//     let balance = await getBalance(receiver, mintPda);
//     assert.ok(balance == firstAirdropAmount);

//     // SECOND AIRDROP
//     const secondAirdropAmount = 200;
//     await airdropTokens(secondAirdropAmount, mintPda, mintPdaBump, receiver, associatedTokenAccount);
//     balance = await getBalance(receiver, mintPda);
//     assert.ok(balance == firstAirdropAmount + secondAirdropAmount);
//   });
// });

describe("Faucet", () => {
  const provider = getProvider();
  const faucetProgram = workspace.Faucet as Program<Faucet>;

  let faucetConfig: web3.Keypair;
  let testTokenMint: web3.PublicKey;
  let testTokenAuthority: web3.PublicKey;
  let nonce: number;

  const testTokenDecimals = 9;
  const dripVolume: BN = new BN(10 ** testTokenDecimals);

  before(async () => {
    faucetConfig = web3.Keypair.generate();
    [testTokenAuthority, nonce] = await web3.PublicKey.findProgramAddress(
      [faucetConfig.publicKey.toBuffer()],
      faucetProgram.programId
    );
    testTokenMint = await createMint(provider, testTokenAuthority, testTokenDecimals);
    console.log("faucetConfig:", faucetConfig.publicKey.toString());
    console.log("faucetProgram.programId", faucetProgram.programId.toString());
    console.log("testTokenAuthority:", testTokenAuthority.toString());
    console.log("nonce", nonce);
    console.log("testTokenMint", testTokenMint.toString());
  });

  describe("#initialize", () => {
    it("should init successful", async () => {
      // let ix = await faucetProgram.account.faucetConfig.createInstruction(faucetConfig);

      await faucetProgram.rpc.initialize(nonce, dripVolume, {
        accounts: {
          faucetConfig: faucetConfig.publicKey,
          tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID,
          tokenMint: testTokenMint,
          tokenAuthority: testTokenAuthority,
          rent: web3.SYSVAR_RENT_PUBKEY,

          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId
        },
        signers: [faucetConfig],
        // instructions: [ix],
      });

      console.log(faucetConfig.publicKey.toString());

      const faucetConfigAccount = await faucetProgram.account.faucetConfig.fetch(faucetConfig.publicKey);

      assert.strictEqual(
        faucetConfigAccount.tokenProgram.toBase58(),
        TokenInstructions.TOKEN_PROGRAM_ID.toBase58()
      );
      assert.strictEqual(
        faucetConfigAccount.tokenMint.toBase58(),
        testTokenMint.toBase58()
      );
      assert.strictEqual(
        faucetConfigAccount.tokenAuthority.toBase58(),
        testTokenAuthority.toBase58()
      );
      assert.strictEqual(faucetConfigAccount.nonce, nonce);
      assert.strictEqual(
        faucetConfigAccount.dripVolume.toNumber(),
        dripVolume.toNumber()
      );
    });
  });

  describe("#drip", () => {
    it("should drip successful", async () => {
      const signers: web3.Keypair[] = [];
      const instructions: web3.TransactionInstruction[] = [];
      const receiver = web3.Keypair.generate();
      const receiverTokenAccount = web3.Keypair.generate();
      instructions.push(
        ...(await createTokenAccountInstrs(
          provider,
          receiverTokenAccount.publicKey,
          testTokenMint,
          receiver.publicKey
        ))
      );
      signers.push(receiverTokenAccount);

      const tokenMintInfo = await getMintInfo(provider, testTokenMint);
      await faucetProgram.rpc.drip({
        accounts: {
          faucetConfig: faucetConfig.publicKey,
          tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID,
          tokenMint: testTokenMint,
          receiver: receiverTokenAccount.publicKey,
          tokenAuthority: tokenMintInfo.mintAuthority!!
        },
        instructions: instructions,
        signers: signers,
      });

      const tokenAccount = await getTokenAccount(
        provider,
        receiverTokenAccount.publicKey
      );

      assert.strictEqual(tokenAccount.amount.toNumber(), dripVolume.toNumber());
    });
  });
});
