const { assert } = require("chai");
const wasm_tester = require("circom_tester").wasm;

describe("Validate circuit", function () {
  let validateCircuit;

  before(async function () {
    validateCircuit = await wasm_tester("validate/validate.circom");
  });

  it("Should generate the witness successfully", async function () {
    let input = {
      serial: '0x53ffa2e1',
      nonce: 10,
     };
    const witness = await validateCircuit.calculateWitness(input);
    await validateCircuit.assertOut(witness, {});
  });
});

