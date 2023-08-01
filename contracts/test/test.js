const { expect } = require("chai");
const { ethers } = require("hardhat");
const { exportCallDataGroth16 } = require("./utils/utils");

describe("On-chain ZKP", function () {
  let verifier;
  let signer, signer1;

  before(async function () {
    [signer, signer1] = await ethers.getSigners();

    verifier = await ethers.deployContract("Groth16Verifier", []);
    await verifier.waitForDeployment();
    const verifierAddr = await verifier.getAddress();
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
});
