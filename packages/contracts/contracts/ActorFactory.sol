// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {Actor} from "./Actor.sol";

/**
 * @dev This contract is used to deploy Actor contracts using CREATE2.
 */
contract ActorFactory {
    event Deployed(address indexed actorAddress, string indexed mainchainAddress, bytes32 salt);

    /**
     * @dev Deploys an Actor contract using CREATE2.
     *
     * @param mainchainAddress The mainchain address of the user
     * @param salt The salt used to deploy the actor
     */
    function deploy(string calldata mainchainAddress, bytes32 salt) public returns (Actor) {
        // Using CREATE2 to have deterministic actor address tied to the `mainchainAddress`
        Actor actor = new Actor{salt: salt}(mainchainAddress);

        emit Deployed(address(actor), mainchainAddress, salt);

        return actor;
    }

    /**
     * @dev Deploys an Actor contract using CREATE2 and executes the first transaction.
     *
     * @param mainchainAddress The mainchain address of the user
     * @param salt The salt used to deploy the actor
     * @param signature The signature of the transaction
     * @param key The public key used to verify the signature
     * @param gasLimit The gas limit of the transaction
     */
    function deployAndExecute(
        string calldata mainchainAddress,
        bytes32 salt,
        bytes calldata signature,
        bytes calldata key,
        uint256 gasLimit
    ) external {
        Actor actor = deploy(mainchainAddress, salt);

        actor.execute{gas: gasLimit}(signature, key);
    }

    /**
     * @dev Returns the address of the actor contract that would be/was deployed using CREATE2.
     *
     * @param mainchainAddress The mainchain address of the user
     * @param salt The salt used to deploy the actor
     */
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
