// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import {Actor} from "./Actor.sol";

contract ActorFactory {
    event Deployed(address indexed actorAddress, string indexed mainchainAddress, bytes32 salt);

    function deploy(string calldata mainchainAddress, bytes32 salt) public {
        Actor actor = new Actor{salt: salt}(mainchainAddress);

        emit Deployed(address(actor), mainchainAddress, salt);
    }
}
