// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import {Actor} from "./Actor.sol";

contract ActorFactory {
    event Deployed(address indexed actorAddress);

    function deploy(bytes32 salt, bytes memory initCode) public {
        address actor;

        assembly {
            actor := create2(callvalue(), add(initCode, 32), mload(initCode), salt)

            if iszero(extcodesize(actor)) {
                revert(0, 0)
            }
        }

        emit Deployed(actor);
    }
}
