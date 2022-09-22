// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

contract ExampleContract {
    function foo(string calldata message) public pure returns (string calldata) {
        return message;
    }
}
