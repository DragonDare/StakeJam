// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {StakingPool} from "./StakingPool.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract StakingPoolFactory is AccessControl {
    bytes32 public constant REGISTRY_ROLE = keccak256("REGISTRY_ROLE");

    address public immutable implementation;

    event PoolCreated(address indexed pool, uint256 indexed projectId);

    constructor(address admin, address _implementation) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REGISTRY_ROLE, admin);
        implementation = _implementation;
    }

    function createPool(
        address projectRegistry,
        uint256 projectId,
        uint256 roleId,
        address applicant,
        address stakeToken,
        uint16  stakersBps,
        uint16  applicantBps,
        uint16  protocolBps,
        address protocolTreasury
    ) external onlyRole(REGISTRY_ROLE) returns (address pool) {
        pool = Clones.clone(implementation);
        StakingPool(pool).initialize(
            projectRegistry,
            projectId,
            roleId,
            applicant,
            stakeToken,
            stakersBps,
            applicantBps,
            protocolBps,
            protocolTreasury
        );
        emit PoolCreated(pool, projectId);
    }

    // allow ProjectRegistry to be granted REGISTRY_ROLE
    function grantRegistry(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(REGISTRY_ROLE, account);
    }
}
