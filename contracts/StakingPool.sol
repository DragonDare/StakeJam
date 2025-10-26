// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {HireVerifier} from "./HireVerifier.sol";

contract StakingPool is EIP712 {
    using SafeERC20 for IERC20;

    // --- immutables set via initialize ---
    address public projectRegistry; // allowed to initialize
    uint256 public projectId;
    uint256 public roleId;
    address public applicant;
    IERC20  public stakeToken;

    // payout config (in basis points, sum <= 10000)
    uint16  public stakersBps;      // e.g., 8000 = 80%
    uint16  public applicantBps;    // e.g., 2000 = 20%
    uint16  public protocolBps;     // optional
    address public protocolTreasury;

    // state
    bool    public hireConfirmed;
    address public employerOfRecord;
    uint256 public totalStaked;
    mapping(address => uint256) public balances;
    mapping(address => bool)    public rewardClaimed; // stakers
    uint256 public nonceUsed;  // simplistic nonce for hire (one-shot)

    event Initialized(uint256 indexed projectId, uint256 roleId, address stakeToken, address applicant);
    event Staked(address indexed staker, uint256 amount);
    event Unstaked(address indexed staker, uint256 amount);
    event HireConfirmed(address indexed employer, uint256 salaryBand, uint256 deadline);
    event RewardClaimed(address indexed staker, uint256 amount);
    event ApplicantPaid(address indexed applicant, uint256 amount);
    event ProtocolPaid(address indexed treasury, uint256 amount);

    error NotInitialized();
    error AlreadyInitialized();
    error AlreadyHired();
    error PastDeadline();
    error NotEnoughStake();
    error NothingToClaim();

    bool private _initialized;

    constructor() EIP712("StakingPool", "1") {}

    function initialize(
        address _projectRegistry,
        uint256 _projectId,
        uint256 _roleId,
        address _applicant,
        address _stakeToken,
        uint16  _stakersBps,
        uint16  _applicantBps,
        uint16  _protocolBps,
        address _protocolTreasury
    ) external {
        if (_initialized) revert AlreadyInitialized();
        _initialized = true;

        projectRegistry   = _projectRegistry;
        projectId         = _projectId;
        roleId            = _roleId;
        applicant         = _applicant;
        stakeToken        = IERC20(_stakeToken);
        stakersBps        = _stakersBps;
        applicantBps      = _applicantBps;
        protocolBps       = _protocolBps;
        protocolTreasury  = _protocolTreasury;

        emit Initialized(projectId, roleId, _stakeToken, applicant);
    }

    // --- staking ---

    function stake(uint256 amount) external {
        require(_initialized, "NotInitialized");
        require(!hireConfirmed, "AlreadyHired");
        stakeToken.safeTransferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
        totalStaked += amount;
        emit Staked(msg.sender, amount);
    }

    // optional early unstake before hire (can disable for hackathon by leaving as is or require(false))
    function unstake(uint256 amount) external {
        require(!hireConfirmed, "AlreadyHired");
        uint256 bal = balances[msg.sender];
        if (bal < amount) revert NotEnoughStake();
        balances[msg.sender] = bal - amount;
        totalStaked -= amount;
        stakeToken.safeTransfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    // --- hire & payout ---

    // Employer signs typed data: Hire(projectId, employer, roleId, salaryBand, deadline, nonce)
    function confirmHire(
        address employer,
        uint256 salaryBand,
        uint256 deadline,
        uint256 nonce,
        bytes calldata signature
    ) external {
        require(_initialized, "NotInitialized");
        if (hireConfirmed) revert AlreadyHired();
        if (block.timestamp > deadline) revert PastDeadline();

        // EIP-712 digest
        bytes32 structHash = HireVerifier.hashHire(projectId, employer, roleId, salaryBand, deadline, nonce);
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = HireVerifier.recoverSigner(digest, signature);
        require(signer == employer, "bad sig");

        // lock state
        hireConfirmed   = true;
        employerOfRecord = employer;
        nonceUsed       = nonce;
        emit HireConfirmed(employer, salaryBand, deadline);

        // No immediate payout here to allow claims by stakers (pro-rata)
        // Applicant + protocol can be paid immediately if you want:
        _payApplicantAndProtocol();
    }

    function _payApplicantAndProtocol() internal {
        uint256 bal = stakeToken.balanceOf(address(this));
        if (bal == 0) return;

        uint256 toApplicant = (bal * applicantBps) / 10000;
        uint256 toProtocol  = (bal * protocolBps) / 10000;

        if (toApplicant > 0) {
            stakeToken.safeTransfer(applicant, toApplicant);
            emit ApplicantPaid(applicant, toApplicant);
        }
        if (toProtocol > 0 && protocolTreasury != address(0)) {
            stakeToken.safeTransfer(protocolTreasury, toProtocol);
            emit ProtocolPaid(protocolTreasury, toProtocol);
        }
        // remaining stays for staker claims
    }

    // Stakers claim pro-rata: (stake / totalStaked) * stakersPool
    function claimReward() external {
        require(hireConfirmed, "not hired");
        if (rewardClaimed[msg.sender]) revert NothingToClaim();

        uint256 userStake = balances[msg.sender];
        require(userStake > 0, "no stake");

        uint256 bal = stakeToken.balanceOf(address(this)); // remaining after applicant/protocol paid
        uint256 amount = (bal * userStake) / totalStaked;
        rewardClaimed[msg.sender] = true;
        stakeToken.safeTransfer(msg.sender, amount);
        emit RewardClaimed(msg.sender, amount);
    }
}
