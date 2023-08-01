//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.15;

interface IVerifier {
    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory input
    ) external view returns (bool);
}

contract ContractWallet {
    address public verifierAddr;
    uint public nonce;

    constructor(address _verifierAddr) {
        verifierAddr = _verifierAddr;
    }

    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[2] memory input
    ) public view returns (bool) {
        return IVerifier(verifierAddr).verifyProof(a, b, c, input);
    }

    function validate(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[2] memory input
    ) external {
        require(input[1] == nonce, "Wrong nonce");
        require(verifyProof(a, b, c, input), "Failed proof check");
        nonce += 1;
    }
}

