// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import {Actor} from "./Actor.sol";

contract ActorFactory {
    event Deployed(address indexed actorAddress, string indexed mainchainAddress, bytes32 salt);

    function deploy(string calldata mainchainAddress, bytes32 salt) public returns (Actor) {
        Actor actor = new Actor{salt: salt}(mainchainAddress);

        emit Deployed(address(actor), mainchainAddress, salt);

        return actor;
    }

    function deployAndExecute(
        string calldata mainchainAddress,
        bytes32 salt,
        bytes calldata signature,
        bytes calldata key
    ) external returns (bool, bytes memory) {
        Actor actor = deploy(mainchainAddress, salt);

        return actor.execute(signature, key);
    }

    function getActorAddress(
        string calldata mainchainAddress,
        bytes32 salt
    ) external view returns (address) {
        bytes memory byteCode = type(Actor).creationCode;

        bytes memory initCode = abi.encodePacked(byteCode, abi.encode(mainchainAddress));

        bytes32 hash = keccak256(
            abi.encodePacked(bytes1(0xff), address(this), salt, keccak256(initCode))
        );

        return address(uint160(uint(hash)));
    }
}
