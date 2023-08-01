pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template Validate() {
  signal input serial;
  signal input nonce;
  signal output o;

  component poseidon = Poseidon(3);
  poseidon.inputs[0] <== serial;
  poseidon.inputs[1] <== nonce;
  poseidon.inputs[2] <== 1123581321;

  o <== poseidon.out;
}

component main {public [nonce]} = Validate();
