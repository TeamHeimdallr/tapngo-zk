//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.15;

import "./BaseAccount.sol";
import "./validateVerifier.sol";

contract ContractWallet is BaseAccount, Groth16Verifier {
    uint public nonce;
    address public owner;
    IEntryPoint private immutable _entryPoint;

    constructor(IEntryPoint anEntryPoint) {
        _entryPoint = anEntryPoint;
    }

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    function entryPoint() public view override returns (IEntryPoint) {
        return _entryPoint;
    }

    function setOwner(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[2] calldata input,
        address _newowner
    ) external {
        require(
            verifyProof(a, b, c, input),
            "Need to prove that you have ZK proof for setting owner"
        );
        owner = _newowner;
    }

    /**
     * execute a transaction (called directly from owner, or by entryPoint)
     */
    function execute(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[2] calldata input,
        address dest,
        uint256 value,
        bytes calldata func
    ) external {
        _requireFromEntryPointOrOwnerOrZKP(a, b, c, input);
        _call(dest, value, func);
    }

    /**
     * execute a sequence of transactions
     * @dev to reduce gas consumption for trivial case (no value), use a zero-length array to mean zero value
     */
    function executeBatch(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[2] calldata input,
        address[] calldata dest,
        uint256[] calldata value,
        bytes[] calldata func
    ) external {
        _requireFromEntryPointOrOwnerOrZKP(a, b, c, input);
        require(
            dest.length == func.length &&
                (value.length == 0 || value.length == func.length),
            "wrong array lengths"
        );
        if (value.length == 0) {
            for (uint256 i = 0; i < dest.length; i++) {
                _call(dest[i], 0, func[i]);
            }
        } else {
            for (uint256 i = 0; i < dest.length; i++) {
                _call(dest[i], value[i], func[i]);
            }
        }
    }

    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    // Require the function call went through EntryPoint or owner or someone having ZK proof
    function _requireFromEntryPointOrOwnerOrZKP(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[2] calldata input
    ) internal view {
        require(
            msg.sender == address(entryPoint()) ||
                msg.sender == owner ||
                verifyProof(a, b, c, input),
            "account: not Owner or EntryPoint"
        );
    }

    function _validateProof(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[2] calldata input
    ) internal {
        require(input[1] == nonce, "Wrong nonce");
        require(verifyProof(a, b, c, input), "Failed proof check");
        nonce += 1;
    }

    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) internal override returns (uint256 validationData) {
        // use ZKP instead of signature
        return 0;
    }
}
