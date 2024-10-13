// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ChitFund {
    address public organizer;
    string public name; // Name of the ChitFund
    uint256 public contributionAmount; // Stored in Wei
    uint256 public totalParticipants;
    uint256 public currentCycle;
    uint256 public totalCycles;
    uint256 public cycleDuration; // Duration in months (or seconds if you prefer using seconds)
    uint256 public startTime; // Start timestamp (UNIX format)
    uint256 public collateralAmount; // 10% of contributionAmount
    bool public fundStarted;

    struct Participant {
        address payable addr;
        bool hasContributed;
        bool hasStakedCollateral;
        bool hasReceivedFund;
    }

    Participant[] public participants;
    mapping(address => uint256) public participantIndex;
    uint256 public totalCollateralStaked;

    modifier onlyOrganizer() {
        require(
            msg.sender == organizer,
            "Only organizer can perform this action"
        );
        _;
    }

    modifier onlyParticipant() {
        require(
            isParticipant(msg.sender),
            "Only participants can perform this action"
        );
        _;
    }

    event ContributionReceived(
        address participant,
        uint256 amount,
        uint256 cycle
    );
    event FundDisbursed(address recipient, uint256 amount, uint256 cycle);
    event CollateralStaked(address participant, uint256 amount);
    event FundStarted();

    /**
     * @notice Initializes a new ChitFund contract
     * @param _organizer The address of the organizer
     * @param _name The name of the ChitFund
     * @param _contributionAmountInEther Contribution amount per cycle in ETH (e.g., 0.001 for 0.001 ETH)
     * @param _totalParticipants Total number of participants
     * @param _totalCycles Total number of cycles (months or iterations)
     * @param _cycleDuration Duration of each cycle in seconds (if using seconds instead of months)
     * @param _startTime The UNIX timestamp when the first cycle starts
     * @param _participants Array of participant addresses
     */
    constructor(
        address _organizer,
        string memory _name,
        uint256 _contributionAmountInEther,
        uint256 _totalParticipants,
        uint256 _totalCycles,
        uint256 _cycleDuration, // Cycle duration in seconds or months (e.g., 30 days = 2592000 seconds)
        uint256 _startTime,
        address[] memory _participants
    ) {
        require(
            _participants.length == _totalParticipants,
            "Participants count mismatch"
        );

        organizer = _organizer;
        name = _name; // Set the name of the ChitFund
        contributionAmount = _contributionAmountInEther * 1 ether; // Convert ETH to Wei
        totalParticipants = _totalParticipants;
        totalCycles = _totalCycles;
        cycleDuration = _cycleDuration; // Duration of each cycle (in months or seconds)
        startTime = _startTime; // The timestamp when the first cycle starts
        collateralAmount = contributionAmount / 10; // 10% of contribution amount as collateral
        currentCycle = 1;

        // Initialize participants
        for (uint256 i = 0; i < _participants.length; i++) {
            participants.push(
                Participant({
                    addr: payable(_participants[i]),
                    hasContributed: false,
                    hasStakedCollateral: false,
                    hasReceivedFund: false
                })
            );
            participantIndex[_participants[i]] = i;
        }
    }

    /**
     * @notice Calculates the deadline for the current cycle based on the start time and cycle duration.
     * @param cycle The cycle number to calculate the deadline for.
     * @return The UNIX timestamp for the deadline of the specified cycle.
     */
    function getDeadlineForCycle(uint256 cycle) public view returns (uint256) {
        require(cycle <= totalCycles, "Cycle out of bounds");
        return startTime + (cycle - 1) * cycleDuration; // Add cycleDuration in seconds for each cycle
    }

    /**
     * @notice Retrieves public details about the ChitFund
     * @return _fundAddress Address of the Fund
     * @return _name The name of the ChitFund
     * @return _organizer Address of the organizer
     * @return _contributionAmount Contribution amount per cycle in Wei
     * @return _totalParticipants Total number of participants
     * @return _currentCycle The current cycle number
     * @return _totalCycles The total number of cycles
     * @return _fundStarted Whether the fund has started or not
     * @return _totalCollateralStaked Total collateral staked by participants
     * @return _cycleDuration Duration of each cycle in seconds
     * @return _startTime The start timestamp of the ChitFund
     */
    function getChitFundDetails()
        external
        view
        returns (
            address _fundAddress,
            string memory _name,
            address _organizer,
            uint256 _contributionAmount,
            uint256 _totalParticipants,
            uint256 _currentCycle,
            uint256 _totalCycles,
            bool _fundStarted,
            uint256 _totalCollateralStaked,
            uint256 _cycleDuration,
            uint256 _startTime
        )
    {
        return (
            address(this),
            name,
            organizer,
            contributionAmount,
            totalParticipants,
            currentCycle,
            totalCycles,
            fundStarted,
            totalCollateralStaked,
            cycleDuration,
            startTime
        );
    }

    /**
     * @notice Allows participants to stake their collateral to start the fund
     */
    function stakeCollateral() external payable onlyParticipant {
        require(!fundStarted, "Fund already started");
        require(msg.value == collateralAmount, "Incorrect collateral amount");

        uint256 idx = participantIndex[msg.sender];
        Participant storage participant = participants[idx];
        require(!participant.hasStakedCollateral, "Already staked collateral");

        participant.hasStakedCollateral = true;
        totalCollateralStaked += msg.value;

        emit CollateralStaked(msg.sender, msg.value);

        // Start the fund when all participants have staked collateral
        if (totalCollateralStaked == collateralAmount * totalParticipants) {
            fundStarted = true;
            emit FundStarted();
        }
    }

    /**
     * @notice Allows participants to contribute for the current cycle
     */
    function contribute() external payable onlyParticipant {
        require(fundStarted, "Fund has not started yet");
        require(currentCycle <= totalCycles, "All cycles completed");

        uint256 cycleDeadline = getDeadlineForCycle(currentCycle);
        require(
            block.timestamp <= cycleDeadline,
            "Contribution period ended for this cycle"
        );
        require(
            msg.value == contributionAmount,
            "Incorrect contribution amount"
        );

        uint256 idx = participantIndex[msg.sender];
        Participant storage participant = participants[idx];
        require(!participant.hasContributed, "Already contributed this cycle");

        participant.hasContributed = true;

        emit ContributionReceived(msg.sender, msg.value, currentCycle);

        if (_allContributionsReceived()) {
            _disburseFunds();
        }
    }

    /**
     * @notice Checks if all contributions for the current cycle have been received
     * @return True if all contributions are received, false otherwise
     */
    function _allContributionsReceived() internal view returns (bool) {
        for (uint256 i = 0; i < participants.length; i++) {
            if (!participants[i].hasContributed) {
                return false;
            }
        }
        return true;
    }

    /**
     * @notice Disburses the pooled funds to the next eligible participant
     */
    function _disburseFunds() internal {
        address payable recipient;

        // Select the next participant who hasn't received the fund yet
        for (uint256 i = 0; i < participants.length; i++) {
            Participant storage participant = participants[i];
            if (!participant.hasReceivedFund) {
                recipient = participant.addr;
                participant.hasReceivedFund = true;
                break;
            }
        }

        uint256 fundAmount = contributionAmount * totalParticipants;
        recipient.transfer(fundAmount);

        emit FundDisbursed(recipient, fundAmount, currentCycle);

        // Reset contributions for next cycle
        for (uint256 i = 0; i < participants.length; i++) {
            participants[i].hasContributed = false;
        }

        currentCycle++;
    }

    /**
     * @notice Checks if all cycles are completed
     * @return True if all cycles are completed, false otherwise
     */
    function isFundCompleted() external view returns (bool) {
        return currentCycle > totalCycles;
    }

    /**
     * @notice Retrieves participant details
     * @param _addr The participant's address
     * @return hasStakedCollateral Whether the participant has staked collateral to begin fund
     * @return hasContributed Whether the participant has contributed in the current cycle
     * @return hasReceivedFund Whether the participant has received the fund
     */
    function getParticipantDetails(
        address _addr
    )
        external
        view
        returns (
            bool hasStakedCollateral,
            bool hasContributed,
            bool hasReceivedFund
        )
    {
        if (!isParticipant(_addr)) {
            return (false, false, false);
        }
        uint256 idx = participantIndex[_addr];
        Participant storage participant = participants[idx];
        return (
            participant.hasStakedCollateral,
            participant.hasContributed,
            participant.hasReceivedFund
        );
    }

    /**
     * @notice Checks if an address is a participant
     * @param _addr The address to check
     * @return True if the address is a participant, false otherwise
     */
    function isParticipant(address _addr) public view returns (bool) {
        uint256 idx = participantIndex[_addr];
        return participants.length > idx && participants[idx].addr == _addr;
    }

    /**
     * @notice Returns the next eligible participant who hasn't received the fund in the current cycle
     * @return The address of the next recipient
     */
    function getNextRecipient() public view returns (address) {
        for (uint256 i = 0; i < participants.length; i++) {
            if (!participants[i].hasReceivedFund) {
                return participants[i].addr;
            }
        }
        revert("All participants have received the fund for this cycle.");
    }

    /**
     * @notice Returns the contribution amount each participant has to pay in Wei
     * @return The contribution amount in Wei
     */
    function getContributionAmount() public view returns (uint256) {
        return contributionAmount;
    }

    /**
     * @notice Checks if a participant is overdue in making their contribution for the current cycle
     * @param _participant The address of the participant to check
     * @return True if the participant is overdue, false otherwise
     */
    function isParticipantOverdue(
        address _participant
    ) public view returns (bool) {
        require(isParticipant(_participant), "Address is not a participant");
        uint256 idx = participantIndex[_participant];
        Participant storage participant = participants[idx];
        uint256 cycleDeadline = getDeadlineForCycle(currentCycle);

        if (!participant.hasContributed && block.timestamp > cycleDeadline) {
            return true; // Participant is overdue if they haven't contributed and the deadline has passed
        }
        return false;
    }

    /**
     * @notice Retrieves all participants who are currently overdue for their contributions
     * @return An array of addresses that are overdue
     */
    function getOverdueParticipants() external view returns (address[] memory) {
        uint256 overdueCount = 0;
        uint256 cycleDeadline = getDeadlineForCycle(currentCycle);

        // First, count the number of overdue participants
        for (uint256 i = 0; i < participants.length; i++) {
            if (
                !participants[i].hasContributed &&
                block.timestamp > cycleDeadline
            ) {
                overdueCount++;
            }
        }

        // Initialize the array with the exact size
        address[] memory overdueParticipants = new address[](overdueCount);
        uint256 index = 0;

        // Populate the array with overdue participants
        for (uint256 i = 0; i < participants.length; i++) {
            if (
                !participants[i].hasContributed &&
                block.timestamp > cycleDeadline
            ) {
                overdueParticipants[index] = participants[i].addr;
                index++;
            }
        }

        return overdueParticipants;
    }
}
