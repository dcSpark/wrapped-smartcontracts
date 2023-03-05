// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

/**
 * @dev This is the interface of precompile contract that verifies L1 messages.
 */
interface IL1MsgVerify {
    enum L1Type {
        Algorand,
        Cardano
    }

    function verify(
        L1Type l1Type,
        bytes calldata message,
        bytes calldata key,
        bytes calldata l1Address
    ) external view returns (bool, bytes memory);
}
