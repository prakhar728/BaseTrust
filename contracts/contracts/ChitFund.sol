// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ChitFund {
    address public organizer;
    string public name; // Name of the ChitFund
    uint256 public contributionAmount; // Contribution amount stored in Wei
    uint256 public totalParticipants;
    uint256 public currentCycle;
    uint256 public totalCycles;
    uint256 public cycleDuration; // Duration in seconds
    uint256 public startTime; // Start timestamp (UNIX format)
    uint256 public collateralPercentage; // Collateral percentage set by the creator
    uint256 public collateralAmount; // Calculated based on the contribution amount and collateral percentage
    bool public fundStarted;
    bool private locked; // ReentrancyGuard

    address public nextRecipient; // To keep track of the next recipient

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

    modifier onlyRecipient() {
        require(
            nextRecipient == msg.sender,
            "Only the eligible recipient can claim the funds"
        );
        _;
    }

    modifier nonReentrant() {
        require(!locked, "ReentrancyGuard: reentrant call");
        locked = true;
        _;
        locked = false;
    }

    event ContributionReceived(
        address chitFundAddress,
        address participant,
        uint256 amount,
        uint256 cycle
    );

    event FundDisbursed(
        address chitFundAddress,
        address recipient,
        uint256 amount,
        uint256 cycle
    );

    event CollateralStaked(
        address chitFundAddress,
        address participant,
        uint256 amount
    );

    event FundStarted(address chitFundAddress);

    event FundClaimed(
        address chitFundAddress,
        address recipient,
        uint256 cycle
    );

    event CycleCompleted(address chitFundAddress, uint256 cycle);

    event CollateralReturned(
        address chitFundAddress,
        address participant,
        uint256 amount
    );

    /**
     * @notice Initializes a new ChitFund contract
     * @param _organizer The address of the organizer
     * @param _name The name of the ChitFund
     * @param _contributionAmount Contribution amount per cycle in Wei
     * @param _totalParticipants Total number of participants
     * @param _totalCycles Total number of cycles (iterations)
     * @param _cycleDuration Duration of each cycle in seconds
     * @param _startTime The UNIX timestamp when the first cycle starts
     * @param _participants Array of participant addresses
     * @param _collateralPercentage The percentage of collateral (e.g., 10 for 10%)
     */
    constructor(
        address _organizer,
        string memory _name,
        uint256 _contributionAmount,
        uint256 _totalParticipants,
        uint256 _totalCycles,
        uint256 _cycleDuration,
        uint256 _startTime,
        address[] memory _participants,
        uint256 _collateralPercentage
    ) {
        require(
            _participants.length == _totalParticipants,
            "Participants count mismatch"
        );
        require(
            _collateralPercentage > 0 && _collateralPercentage <= 100,
            "Collateral percentage should be between 1 and 100"
        );

        organizer = _organizer;
        name = _name;
        contributionAmount = _contributionAmount;
        totalParticipants = _totalParticipants;
        totalCycles = _totalCycles;
        cycleDuration = _cycleDuration;
        startTime = _startTime;
        collateralPercentage = _collateralPercentage;
        collateralAmount = (contributionAmount * collateralPercentage) / 100;
        currentCycle = 0;

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

        getNextRecipient();
    }

    function stakeCollateral() external payable onlyParticipant {
        require(!fundStarted, "Fund already started");
        require(msg.value == collateralAmount, "Incorrect collateral amount");

        uint256 idx = participantIndex[msg.sender];
        Participant storage participant = participants[idx];
        require(!participant.hasStakedCollateral, "Already staked collateral");

        participant.hasStakedCollateral = true;
        totalCollateralStaked += msg.value;

        emit CollateralStaked(address(this), msg.sender, msg.value);

        if (totalCollateralStaked == collateralAmount * totalParticipants) {
            fundStarted = true;
            emit FundStarted(address(this));
        }
    }

    function contribute() external payable onlyParticipant {
        require(fundStarted, "Fund has not started yet");
        require(currentCycle <= totalCycles, "All cycles completed");

        uint256 participantContribution = contributionAmount /
            totalParticipants;
        require(
            msg.value == participantContribution,
            "Incorrect contribution amount"
        );

        uint256 idx = participantIndex[msg.sender];
        Participant storage participant = participants[idx];
        require(!participant.hasContributed, "Already contributed this cycle");

        participant.hasContributed = true;

        emit ContributionReceived(
            address(this),
            msg.sender,
            msg.value,
            currentCycle
        );
    }

    /**
     * @notice Returns collateral to all participants after fund completion. Can only be called once.
     */
    function returnAllCollateral() external nonReentrant {
        require(currentCycle > totalCycles, "Fund not completed yet");
        require(totalCollateralStaked > 0, "Collateral already returned");

        // Iterate over all participants and return their collateral
        for (uint256 i = 0; i < totalParticipants; i++) {
            Participant storage participant = participants[i];

            // Check if the participant has staked collateral and return it
            if (participant.hasStakedCollateral) {
                participant.hasStakedCollateral = false; // Mark the collateral as returned
                totalCollateralStaked -= collateralAmount;

                // Transfer the collateral back to the participant
                (bool success, ) = participant.addr.call{
                    value: collateralAmount
                }("");
                require(success, "Collateral return failed");
            }
        }

        // Ensure that collateral cannot be returned again
        require(totalCollateralStaked == 0, "Collateral return incomplete");
    }

    function claim() external onlyRecipient {
        require(fundStarted, "Fund has not started yet");
        require(_allContributionsReceived(), "Not all contributions received");

        _disburseFunds();
        emit FundClaimed(address(this), msg.sender, currentCycle);

        // Request randomness for the next recipient
        getNextRecipient();
    }

    function _disburseFunds() internal nonReentrant {
        require(
            _allContributionsReceived(),
            "All contributions not received yet"
        );

        address payable recipient = payable(nextRecipient);

        uint256 fundAmount = contributionAmount;
        (bool success, ) = recipient.call{value: fundAmount}("");

        if (success) {
            uint256 recipientIndex = participantIndex[recipient];
            participants[recipientIndex].hasReceivedFund = true;

            emit FundDisbursed(
                address(this),
                recipient,
                fundAmount,
                currentCycle
            );

            // Reset contributions for next cycle
            for (uint256 i = 0; i < totalParticipants; i++) {
                participants[i].hasContributed = false;
            }

            currentCycle++;
            emit CycleCompleted(address(this), currentCycle - 1);
        } else {
            revert("Fund transfer failed");
        }
    }

    function getDeadlineForCycle(uint256 cycle) public view returns (uint256) {
        require(cycle <= totalCycles, "Cycle out of bounds");
        return startTime + (cycle - 1) * cycleDuration; // Add cycleDuration in seconds for each cycle
    }

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
            uint256 _startTime,
            uint256 _collateralAmount,
            address _nextRecipient // Add next recipient at the end
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
            startTime,
            collateralAmount,
            nextRecipient
        );
    }

    function _allContributionsReceived() internal view returns (bool) {
        for (uint256 i = 0; i < totalParticipants; i++) {
            if (!participants[i].hasContributed) {
                return false;
            }
        }
        return true;
    }

    function getNextRecipientAddress() public view returns (address) {
        return nextRecipient;
    }

    function isParticipant(address _addr) public view returns (bool) {
        uint256 idx = participantIndex[_addr];
        return totalParticipants > idx && participants[idx].addr == _addr;
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
     * @notice Returns the next eligible participant who hasn't received the fund in the current cycle
     */
    function getNextRecipient() public {
        bool recipientFound = false;
        for (uint256 i = 0; i < totalParticipants; i++) {
            // Check if the participant has not received the fund
            if (participants[i].hasReceivedFund == false) {
                nextRecipient = participants[i].addr;
                recipientFound = true;
                break; // Exit the loop once the next recipient is found
            }
        }

        // If no recipient is found after iterating, revert the transaction
        if (recipientFound == false && currentCycle > totalCycles) {
            revert("All participants have received the fund!");
        }
    }

    /**
     * @notice Returns the contribution amount each participant has to pay in Wei
     * @return The contribution amount in Wei
     */
    function getContributionAmount() public view returns (uint256) {
        return contributionAmount / totalParticipants;
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
        for (uint256 i = 0; i < totalParticipants; i++) {
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
        for (uint256 i = 0; i < totalParticipants; i++) {
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
