// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

contract Counter {
    uint256 public count;

    function increment(uint256 amount) external {
        count += amount;
    }
}
