// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import {Actor} from "../Actor.sol";
import {ExampleContract} from "./ExampleContract.sol";

import "hardhat/console.sol";

contract ExampleActor is Actor {
    struct Payload {
        bool pass;
        string message;
        ExampleContract destinationContract;
    }

    constructor(bytes memory payload, uint256 emergencyWithdrawalTimeout)
        Actor(payload, emergencyWithdrawalTimeout)
    {}

    function executePredicate() internal view override returns (bool) {
        Payload memory payload = _getPayload();
        return payload.pass;
    }

    function executeCallback() internal view override returns (bytes memory) {
        Payload memory payload = _getPayload();

        string memory response = payload.destinationContract.foo(payload.message);

        return abi.encode(response);
    }

    function withdrawPredicate() internal pure override returns (bool) {
        return true;
    }

    function withdrawCallback() internal pure override returns (bytes memory) {
        return abi.encode(true);
    }

    function emergencyWithdrawCallback() internal pure override returns (bytes memory) {
        return abi.encode(true);
    }

    function _getPayload() private view returns (Payload memory) {
        return abi.decode(_payload, (Payload));
    }
}
