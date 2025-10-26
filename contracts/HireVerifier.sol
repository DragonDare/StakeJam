// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

library HireVerifier {
    // keccak256("Hire(uint256 projectId,address employer,uint256 roleId,uint256 salaryBand,uint256 deadline,uint256 nonce)")
    bytes32 internal constant HIRE_TYPEHASH = 0x7e1dcf0a7d1a6d8f0f7f4b56b2c7a2a9a8cb1b2a7c0b7e2a1c8e9a5c8f0b2a31;

    function hashHire(
        uint256 projectId,
        address employer,
        uint256 roleId,
        uint256 salaryBand,
        uint256 deadline,
        uint256 nonce
    ) internal pure returns (bytes32) {
        return keccak256(abi.encode(
            HIRE_TYPEHASH,
            projectId,
            employer,
            roleId,
            salaryBand,
            deadline,
            nonce
        ));
    }

    function recoverSigner(bytes32 digest, bytes calldata signature) internal pure returns (address) {
        return ECDSA.recover(digest, signature);
    }
}
