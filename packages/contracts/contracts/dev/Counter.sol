// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

/**
 * @dev This contract is used to test the execution of a contract.
 */
contract Counter {
    uint256 public count;

    function increment(uint256 amount) external {
        count += amount;
    }
}
