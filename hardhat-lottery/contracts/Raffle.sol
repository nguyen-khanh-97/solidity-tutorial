// Enter the lottery (Pay some fee)
// Pick a random winner (verifiably random)
// Winner to be selected in X minutes -> completely automate
// Chainlink Oracale -> Randomness, Automated Execution (Chainlink Keeper)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

// error
error Raffle__NotOwner();
error Raffle__NotEnoughETH();
error Raffle__NotOpen();
error Raffle__TransferFailed();
error Raffle__UpKeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);

/** @title A sample raffle contract
 *  @author NguyenKhanh
 *  @notice This contract is for creating an untamperable decentralized smart contract
 *  @dev Implements Chainlink VRF v2 and Chainlink Keepers
 */
contract Raffle is VRFConsumerBaseV2, KeeperCompatible {
    /* Type declarations */
    enum RaffleState {
        OPEN,
        CLOSE,
        PENDING,
        CACULATING
    }

    /* State variables */
    uint256 private s_entranceFee;
    address payable[] private s_players;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLine;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    address private immutable i_owner;

    /* Lottery Variables */
    address payable private s_currentWinner;
    RaffleState private s_raffleState;
    uint256 private s_lastTimeStamp;
    uint256 private s_interval;

    /* Events */
    event RaffleEnter(address indexed player);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event WinerPicked(address indexed winner);

    /* Modifiers */
    modifier onlyOwner() {
        if (msg.sender != i_owner) revert Raffle__NotOwner();
        _;
    }

    /* functions */

    constructor(
        address vrfCoordinatorV2,
        uint256 entraceFee,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_owner = msg.sender;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        s_entranceFee = entraceFee;
        i_gasLine = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        s_interval = interval;
    }

    function setEntranceFee(uint256 entranceFee) public onlyOwner {
        s_entranceFee = entranceFee;
    }

    function setInterval(uint256 interval) public onlyOwner {
        s_interval = interval;
    }

    function enterRaffle() public payable {
        // require(msg.value >= s_entranceFee, "Not enough ETH");
        if (msg.value < s_entranceFee) {
            revert Raffle__NotEnoughETH();
        }
        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle__NotOpen();
        }
        s_players.push(payable(msg.sender));
        // Emit an event when we update a dynamic array or mapping
        // Named the event with the function name reversed
        emit RaffleEnter(msg.sender);
    }

    /* external function */
    /**
     * @dev This is the function that the Chainlink Keeper nodes call
     * @dev they look for the `upkeepNeeded` to return true
     * @dev The following should be true in order to return true:
     * @dev 1. Our time interval should have pass
     * @dev 2. The lottery should have at least 1 player, and have some ETH
     * @dev 3. Our subscription is funded with LINK
     * @dev 4. The loterry should be in an `open` state
     */
    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        // We don't use the checkData in this example. The checkData is defined when the Upkeep was registered.
        bool isOpen = (RaffleState.OPEN == s_raffleState);
        bool timpePass = ((block.timestamp - s_lastTimeStamp) >= s_interval);
        bool hasPlayer = (s_players.length > 0);
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = isOpen && timpePass && hasPlayer && hasBalance;
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        //We highly recommend revalidating the upkeep in the performUpkeep function
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert Raffle__UpKeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            );
        }

        // We don't use the performData in this example. The performData is generated by the Keeper's call to your checkUpkeep function

        // Request a random number
        // Once we get it, do something with it
        // 2 transaction process
        s_raffleState = RaffleState.CACULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLine, // gasLane
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestedRaffleWinner(requestId);
    }

    /* internal function */
    function fulfillRandomWords(
        uint256, /* requestId */
        uint256[] memory randomWords
    ) internal override {
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable currentWinner = s_players[indexOfWinner];
        s_currentWinner = currentWinner;
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        (bool success, ) = currentWinner.call{value: address(this).balance}("");
        // require(success);
        if (!success) {
            revert Raffle__TransferFailed();
        }
        s_players = new address payable[](0);
        emit WinerPicked(currentWinner);
    }

    /* view / pure function */

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getEntraceFee() public view returns (uint256) {
        return s_entranceFee;
    }

    function getPlayers(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getCurrentWinner() public view returns (address) {
        return s_currentWinner;
    }

    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    function getNumWords() public pure returns (uint32) {
        return NUM_WORDS;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getRequestConfirmations() public pure returns (uint16) {
        return REQUEST_CONFIRMATIONS;
    }

    function getInterval() public view returns (uint256) {
        return s_interval;
    }
}
