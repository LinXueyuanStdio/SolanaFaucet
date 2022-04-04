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

describe("Faucet", () => {
  const provider = getProvider();
  const faucetProgram = workspace.Faucet as Program<Faucet>;

  let faucetConfig: web3.Keypair = web3.Keypair.generate();
  let testTokenMint: web3.PublicKey;
  let testTokenAuthority: web3.PublicKey;
  let nonce: number;

  const testTokenDecimals = 9;
  const dripVolume: BN = new BN(10 ** testTokenDecimals);

  before(async () => {
    [testTokenAuthority, nonce] = await web3.PublicKey.findProgramAddress(
      [faucetConfig.publicKey.toBuffer()],
      faucetProgram.programId
    );
    testTokenMint = await createMint(provider, testTokenAuthority, testTokenDecimals);
  });

  describe("#initialize", () => {
    it("should init successful", async () => {
      await faucetProgram.rpc.initialize(nonce, dripVolume, {
        accounts: {
          faucetConfig: faucetConfig.publicKey,
          tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID,
          tokenMint: testTokenMint,
          tokenAuthority: testTokenAuthority,
          rent: web3.SYSVAR_RENT_PUBKEY,

          user: provider.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId
        },
        signers: [faucetConfig],
        instructions: [
          await faucetProgram.account.faucetConfig.createInstruction(faucetConfig),
        ],
      });

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
          tokenAuthority: tokenMintInfo.mintAuthority!!,

          payer: provider.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId
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

// describe('Faucet', () => {
//   // Configure the client to use the local cluster.
//   anchor.setProvider(anchor.Provider.env());
//   const program = anchor.workspace.Faucet as Program<Faucet>;

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

//   it('Airdrop tokens 2 times and check token account', async () => {
//     // Get the PDA that is the mint for the faucet
//     const [mintPda, mintPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
//       [Buffer.from(anchor.utils.bytes.utf8.encode("faucet-mint"))],
//       program.programId);

//     const receiver = new PublicKey("8hpvAu6cq6qzVM4NpXp9bH2uuT4PEYMJvrXKrSd5tdfR");

//     let associatedTokenAccount = await Token.getAssociatedTokenAddress(
//         ASSOCIATED_TOKEN_PROGRAM_ID,
//         TOKEN_PROGRAM_ID,
//         mintPda,
//         receiver,
//         true
//       );
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
