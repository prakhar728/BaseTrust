// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ChitFund.sol";

contract ChitFundFactory {
    ChitFund[] public chitFunds;

    event ChitFundCreated(address chitFundAddress, address organizer, string name);

    /**
     * @notice Creates a new ChitFund contract
     * @param _name The name of the ChitFund
     * @param _contributionAmountInEther The contribution amount per cycle in ETH (e.g., 0.001 for 0.001 ETH)
     * @param _totalParticipants Total number of participants in the chit fund
     * @param _totalCycles Total number of cycles (months or iterations)
     * @param _cycleDuration Duration of each cycle in seconds
     * @param _startTime The UNIX timestamp when the first cycle starts
     * @param _participants Array of participant wallet addresses
     */
    function createChitFund(
        string memory _name,
        uint256 _contributionAmountInEther,
        uint256 _totalParticipants,
        uint256 _totalCycles,
        uint256 _cycleDuration,
        uint256 _startTime,
        address[] memory _participants
    ) public {
        require(_participants.length == _totalParticipants, "Participants count mismatch");

        // Deploy a new ChitFund contract
        ChitFund newChitFund = new ChitFund(
            msg.sender,
            _name, // Pass the name
            _contributionAmountInEther,
            _totalParticipants,
            _totalCycles,
            _cycleDuration,
            _startTime,
            _participants
        );

        chitFunds.push(newChitFund);

        emit ChitFundCreated(address(newChitFund), msg.sender, _name);
    }

    /**
     * @notice Retrieves all ChitFund contracts created by the factory
     * @return An array of ChitFund contract addresses
     */
    function getAllChitFunds() public view returns (ChitFund[] memory) {
        return chitFunds;
    }
}
