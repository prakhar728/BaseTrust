// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ChitFund.sol";

contract ChitFundFactory {
    ChitFund[] public chitFunds;

    event ChitFundCreated(address chitFundAddress, address organizer);

    /**
     * @notice Creates a new ChitFund contract
     * @param _contributionAmountInEther The contribution amount per cycle in ETH (e.g., 0.001 for 0.001 ETH)
     * @param _totalParticipants Total number of participants in the chit fund
     * @param _contributionDeadlines Array of UNIX timestamps representing the contribution deadlines for each cycle
     * @param _participants Array of participant wallet addresses
     */
    function createChitFund(
        uint256 _contributionAmountInEther,
        uint256 _totalParticipants,
        uint256[] memory _contributionDeadlines,
        address[] memory _participants
    ) public {
        require(_participants.length == _totalParticipants, "Participants count mismatch");
        require(_contributionDeadlines.length == _totalParticipants, "Deadlines count mismatch");

        ChitFund newChitFund = new ChitFund(
            msg.sender,
            _contributionAmountInEther,
            _totalParticipants,
            _contributionDeadlines,
            _participants
        );

        chitFunds.push(newChitFund);

        emit ChitFundCreated(address(newChitFund), msg.sender);
    }

    /**
     * @notice Retrieves all ChitFund contracts created by the factory
     * @return An array of ChitFund contract addresses
     */
    function getChitFunds() public view returns (ChitFund[] memory) {
        return chitFunds;
    }
}
