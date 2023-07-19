// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

/**
 * @dev Testing utils.
 */
contract Utils {
    function sendEtherTo(address payable to) external payable {
        to.transfer(msg.value);
    }
}
