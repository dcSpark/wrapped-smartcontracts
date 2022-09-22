// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import {Actor} from "./Actor.sol";

contract ActorFactory {
    event Deployed(address indexed actorAddress);

    function deploy(
        bytes32 salt,
        bytes calldata txData,
        address destinationContract
    ) public {
        Actor actor = new Actor{salt: salt}(txData, destinationContract);
        emit Deployed(address(actor));
    }
}
