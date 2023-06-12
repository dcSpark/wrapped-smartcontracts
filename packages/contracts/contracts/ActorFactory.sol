// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {Actor} from "./Actor.sol";
import {L1Type} from "./IL1MsgVerify.sol";

/**
 * @dev This contract is used to deploy Actor contracts using CREATE2.
 */
contract ActorFactory {
    L1Type private l1Type;

    event Deployed(address indexed actorAddress, string indexed mainchainAddress, bytes32 salt);

    constructor(L1Type _l1Type) {
        l1Type = _l1Type;
    }

    /**
     * @dev Deploys an Actor contract using CREATE2.
     *
     * @param mainchainAddress The mainchain address of the user
     * @param salt The salt used to deploy the actor
     */
    function deploy(string calldata mainchainAddress, bytes32 salt) public returns (Actor) {
        // Using CREATE2 to have deterministic actor address tied to the `mainchainAddress`
        Actor actor = new Actor{salt: salt}(mainchainAddress, l1Type);

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

        bytes memory initCode = abi.encodePacked(byteCode, abi.encode(mainchainAddress, l1Type));

        bytes32 hash = keccak256(
            abi.encodePacked(bytes1(0xff), address(this), salt, keccak256(initCode))
        );

        return address(uint160(uint(hash)));
    }
}
