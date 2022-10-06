// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import {Actor} from "../Actor.sol";
import {ExampleContract} from "./ExampleContract.sol";

contract ExampleActor is Actor {
    constructor(bytes memory executeArgs, bytes memory executeConditionArgs)
        Actor(executeArgs, executeConditionArgs)
    {}

    function executePredicate(bytes memory executeConditionArgs)
        public
        pure
        override
        returns (bool)
    {
        bool pass = abi.decode(executeConditionArgs, (bool));
        return pass;
    }

    function executeCallback(bytes memory executeArgs)
        public
        view
        override
        returns (bytes memory)
    {
        (string memory message, ExampleContract destinationContract) = abi.decode(
            executeArgs,
            (string, ExampleContract)
        );

        string memory response = destinationContract.foo(message);

        return abi.encode(response);
    }
}
