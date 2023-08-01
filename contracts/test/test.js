const { expect } = require("chai");
const { ethers } = require("hardhat");
const { exportCallDataGroth16 } = require("./utils/utils");

describe("NoxFi", function () {
  let verifier, contractWallet;
  let signer, signer1;

  before(async function () {
    [signer, signer1] = await ethers.getSigners();

    verifier = await ethers.deployContract("Groth16Verifier", []);
    await verifier.waitForDeployment();
    const verifierAddr = await verifier.getAddress();

    contractWallet = await ethers.deployContract("ContractWallet", [verifierAddr]);
    await contractWallet.waitForDeployment();
    const contractWalletAddr = await contractWallet.getAddress();
  });

  /* Note: these test iterations run sequentially and the state is remained */

  it("Should return true for valid proof on-chain", async function () {
    const serial = 0x1234567a;
    const nonce = 10;

    const input = {
      serial: serial,
      nonce: nonce,
    };

    let dataResult = await exportCallDataGroth16(
      input,
      "./zkproof/validate.wasm",
      "./zkproof/validate_final.zkey"
    );

    let result = await verifier.verifyProof(
      dataResult.a,
      dataResult.b,
      dataResult.c,
      dataResult.Input
    );
    expect(result).to.equal(true);
  });

  it("Should fail due to nonce", async function () {
    const serial = 0x1234567a;
    const nonce = 1;

    const input = {
      serial: serial,
      nonce: nonce,
    };

    let dataResult = await exportCallDataGroth16(
      input,
      "./zkproof/validate.wasm",
      "./zkproof/validate_final.zkey"
    );

    await expect(contractWallet.validate(
      dataResult.a,
      dataResult.b,
      dataResult.c,
      dataResult.Input
    )).to.be.reverted;

    const n = await contractWallet.nonce();
    expect(n).to.equal(0);
  });

  it("Should increae nonce", async function () {
    const serial = 0x1234567a;
    const nonce = 0;

    const input = {
      serial: serial,
      nonce: nonce,
    };

    let dataResult = await exportCallDataGroth16(
      input,
      "./zkproof/validate.wasm",
      "./zkproof/validate_final.zkey"
    );

    let result = await contractWallet.validate(
      dataResult.a,
      dataResult.b,
      dataResult.c,
      dataResult.Input
    );

    const n = await contractWallet.nonce();
    expect(n).to.equal(1);
  });
});

