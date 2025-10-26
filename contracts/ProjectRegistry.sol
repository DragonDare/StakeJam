// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {RoleRegistry} from "./RoleRegistry.sol";
import {StakingPoolFactory} from "./StakingPoolFactory.sol";

contract ProjectRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Project {
        uint256 id;
        uint256 roleId;
        address applicant;
        string  uri;           // IPFS/HTTPS metadata
        address pool;          // staking pool
        bool    active;
    }

    RoleRegistry        public roles;
    StakingPoolFactory  public factory;

    uint256 public projectCount;
    mapping(uint256 => Project) public projects;

    // configurable defaults
    uint16  public stakersBps = 8000;
    uint16  public applicantBps = 2000;
    uint16  public protocolBps = 0;
    address public protocolTreasury;

    event ProjectRegistered(uint256 indexed projectId, uint256 indexed roleId, address applicant, string uri, address pool);

    constructor(address admin, address roleRegistry, address stakingFactory, address _protocolTreasury) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        roles = RoleRegistry(roleRegistry);
        factory = StakingPoolFactory(stakingFactory);
        protocolTreasury = _protocolTreasury;
    }

    function setSplits(uint16 _stakersBps, uint16 _applicantBps, uint16 _protocolBps, address _treasury) external onlyRole(ADMIN_ROLE) {
        require(_stakersBps + _applicantBps + _protocolBps <= 10000, "bps>100%");
        stakersBps = _stakersBps;
        applicantBps = _applicantBps;
        protocolBps = _protocolBps;
        protocolTreasury = _treasury;
    }

    function registerProject(uint256 roleId, string calldata uri, address applicant) external returns (uint256 projectId, address pool) {
        RoleRegistry.Role memory r = roles.getRole(roleId);
        require(r.active, "role inactive");

        projectId = ++projectCount;
        // create pool for this project
        pool = factory.createPool(
            address(this),
            projectId,
            roleId,
            applicant,
            r.roleToken,
            stakersBps,
            applicantBps,
            protocolBps,
            protocolTreasury
        );

        projects[projectId] = Project({
            id: projectId,
            roleId: roleId,
            applicant: applicant,
            uri: uri,
            pool: pool,
            active: true
        });

        emit ProjectRegistered(projectId, roleId, applicant, uri, pool);
    }

    function getProject(uint256 projectId) external view returns (Project memory) {
        return projects[projectId];
    }
}
