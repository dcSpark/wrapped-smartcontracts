// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @dev Swaps `amount` of coins for ERC20 token with 1:1 rate.
 * Used for testing.
 */
contract SimpleSwap {
    function swap(IERC20 token) public payable {
        uint256 amount = msg.value;
        token.transfer(msg.sender, amount);
    }
}
