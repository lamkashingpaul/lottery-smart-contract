// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

error Raffle__NotEnoughETHEntered();
error Raffle__NotOpen();
error Raffle__UpkeepNotNeeded(
    uint256 currentBalance,
    uint256 numPlayers,
    uint256 raffleState
);
error Raffle__TransferFailed();

/**
 * @title A sample Raffle contract
 * @author Paul Lam
 * @notice This contract is for creating an untamperable decentralized smart contract lottery
 * @dev This implements Chainlink VRF v2 plus and Chainlink Automation
 */
contract Raffle is VRFConsumerBaseV2Plus, AutomationCompatibleInterface {
    enum RaffleState {
        OPEN,
        CALCULATING
    }

    uint256 private immutable I_ENTRANCE_FEE;
    bytes32 private immutable I_GAS_LANE;
    uint256 private immutable I_SUBSCRIPTION_ID;
    uint32 private immutable I_CALLBACK_GAS_LIMIT;

    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    address payable[] private s_players;

    address private s_recentWinner;
    RaffleState private s_raffleState;
    uint256 private s_lastTimeStamp;
    uint256 private immutable I_INTERVAL;

    /**
     * @notice Emitted when a player enters the raffle
     * @param player Address of the player entering the raffle
     */
    event RaffleEntered(address indexed player);
    /**
     * @notice Emitted when a random winner is requested from Chainlink VRF
     * @param requestId The ID of the VRF request
     */
    event RaffleWinnerRequested(uint256 indexed requestId);
    /**
     * @notice Emitted when a winner is picked and paid
     * @param winner Address of the raffle winner
     */
    event WinnerPicked(address indexed winner);

    constructor(
        address vrfCoordinator,
        uint256 entranceFee,
        bytes32 gasLane,
        uint256 subscriptionId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2Plus(vrfCoordinator) {
        I_ENTRANCE_FEE = entranceFee;
        I_GAS_LANE = gasLane;
        I_SUBSCRIPTION_ID = subscriptionId;
        I_CALLBACK_GAS_LIMIT = callbackGasLimit;

        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        I_INTERVAL = interval;
    }

    /**
     * @notice Enter the raffle by paying the entrance fee
     * @dev The entrance fee is specified in the constructor
     */
    function enterRaffle() public payable {
        if (msg.value < I_ENTRANCE_FEE) {
            revert Raffle__NotEnoughETHEntered();
        }
        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle__NotOpen();
        }
        s_players.push(payable(msg.sender));
        emit RaffleEntered(msg.sender);
    }

    /**
     * @notice This function is called by Chainlink Automation to check if upkeep is needed
     * @dev The following should be true for this to return true:
     * 1. The raffle is open
     * 2. The time interval has passed
     * 3. The contract has at least 1 player
     * 4. The contract has a non-zero balance
     * @return upkeepNeeded True if upkeep is needed, false otherwise
     * @return performData Not used in this implementation, returns 0x0
     */
    // solhint-disable-next-line use-natspec
    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        bool isOpen = s_raffleState == RaffleState.OPEN;
        bool timePassed = (block.timestamp - s_lastTimeStamp) > I_INTERVAL;
        bool hasPlayers = s_players.length > 0;
        bool hasBalance = address(this).balance > 0;

        upkeepNeeded = isOpen && timePassed && hasPlayers && hasBalance;
        performData = "0x";
    }

    /**
     * @notice This function is called by Chainlink Automation to perform upkeep
     * @dev It requests a random winner from Chainlink VRF
     */
    // solhint-disable-next-line use-natspec
    function performUpkeep(bytes calldata /* performData */) external override {
        (bool upkeepNeeded, ) = this.checkUpkeep("");
        if (!upkeepNeeded) {
            revert Raffle__UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            );
        }
        s_lastTimeStamp = block.timestamp;

        requestRandomWinner(false);
    }

    /**
     * @notice Requests a random winner from Chainlink VRF
     * @dev Sets the raffle state to CALCULATING
     * @param enableNativePayment Whether to enable native payment for the VRF request
     * @return requestId The ID of the VRF request
     */
    function requestRandomWinner(
        bool enableNativePayment
    ) internal returns (uint256 requestId) {
        s_raffleState = RaffleState.CALCULATING;

        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: I_GAS_LANE,
                subId: I_SUBSCRIPTION_ID,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: I_CALLBACK_GAS_LIMIT,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({
                        nativePayment: enableNativePayment
                    })
                )
            })
        );
        emit RaffleWinnerRequested(requestId);
    }

    /**
     * @notice This function is called by Chainlink VRF to fulfill the random words request
     * @dev It picks a random winner and transfers the contract balance to them
     * @param randomWords The random words returned by Chainlink VRF
     */
    // solhint-disable-next-line use-natspec
    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] calldata randomWords
    ) internal override {
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;
        s_raffleState = RaffleState.OPEN;
        s_players = new address payable[](0);
        s_lastTimeStamp = block.timestamp;

        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        if (!success) {
            revert Raffle__TransferFailed();
        }

        emit WinnerPicked(recentWinner);
    }

    /**
     * @notice Get the entrance fee required to enter the raffle
     * @return The entrance fee in wei
     */
    function getEntranceFee() public view returns (uint256) {
        return I_ENTRANCE_FEE;
    }

    /**
     * @notice Get a player's address by their index in the players array
     * @param index The index of the player in the array
     * @return The address of the player
     */
    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    /**
     * @notice Get the address of the most recent winner
     * @return The address of the recent winner
     */
    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    /**
     * @notice Get the current state of the raffle
     * @return The current raffle state (OPEN or CALCULATING)
     */
    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    /**
     * @notice Get the number of random words requested from VRF
     * @return The number of words (always 1)
     */
    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    /**
     * @notice Get the current number of players in the raffle
     * @return The number of players
     */
    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    /**
     * @notice Get the timestamp of the last raffle reset
     * @return The timestamp of the last reset
     */
    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    /**
     * @notice Get the number of block confirmations required for VRF
     * @return The number of confirmations (always 3)
     */
    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }

    /**
     * @notice Get the time interval for the raffle
     * @return The time interval in seconds
     */
    function getInterval() public view returns (uint256) {
        return I_INTERVAL;
    }
}
