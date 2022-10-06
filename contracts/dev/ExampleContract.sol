// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "hardhat/console.sol";

contract ExampleContract {
    function foo(string calldata message) public view returns (string memory) {
        console.log(string.concat("Example contract executed with message: ", message));
        return string.concat("I've got the message: ", message);
    }
}
