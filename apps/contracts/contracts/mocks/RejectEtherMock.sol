// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

error RejectEtherMock__RejectEther();

/**
 * @title A mock contract that rejects all incoming ether
 * @notice This contract is for testing purposes only
 * @dev This contract will reject all incoming ether, which can be useful for testing how other contracts handle failed ether transfers
 * @author Paul Lam
 */
contract RejectEtherMock {
    /**
     * @notice Receive function that rejects all incoming ether
     * @dev This function will be called when the contract receives ether without any data, and it will revert the transaction to reject the ether
     */
    receive() external payable {
        revert RejectEtherMock__RejectEther();
    }
}
