// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

/**
 * @dev This contract is used to test runing out of gas.
 */
contract InfiniteLoop {
    uint256 private counter;

    function loop() external {
        while (true) {
            counter++;
        }
    }
}
