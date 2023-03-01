// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

contract InfiniteLoop {
    uint256 private counter;

    function loop() external {
        while (true) {
            counter++;
        }
    }
}
