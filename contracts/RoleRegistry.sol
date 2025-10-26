// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract RoleRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Role {
        uint256 id;
        string  name;        // e.g., "Python Developer"
        uint256 chainId;     // target chain for this role’s staking activity
        address roleToken;   // canonical ERC20 token for stakes (can be 0 for native)
        bool    active;
    }

    uint256 public roleCount;
    mapping(uint256 => Role) public roles;   // roleId => Role
    mapping(string => uint256) public roleIdByName; // optional convenience

    event RoleCreated(uint256 indexed roleId, string name, uint256 chainId, address roleToken);
    event RoleUpdated(uint256 indexed roleId, uint256 chainId, address roleToken, bool active);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
    }

    function createRole(string calldata name, uint256 chainId, address roleToken) external onlyRole(ADMIN_ROLE) returns (uint256 roleId) {
        require(roleIdByName[name] == 0, "name exists");
        roleId = ++roleCount;
        roles[roleId] = Role({ id: roleId, name: name, chainId: chainId, roleToken: roleToken, active: true });
        roleIdByName[name] = roleId;
        emit RoleCreated(roleId, name, chainId, roleToken);
    }

    function updateRole(uint256 roleId, uint256 chainId, address roleToken, bool active) external onlyRole(ADMIN_ROLE) {
        Role storage r = roles[roleId];
        require(r.id != 0, "invalid");
        r.chainId = chainId;
        r.roleToken = roleToken;
        r.active = active;
        emit RoleUpdated(roleId, chainId, roleToken, active);
    }

    function getRole(uint256 roleId) external view returns (Role memory) {
        return roles[roleId];
    }
}
