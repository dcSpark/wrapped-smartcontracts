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

    /**
     * @dev Verifies a signed message from the L1 chain.
     *
     * @param l1Type Determines which L1 chain to verify the message for
     * @param message Signed message to verify
     * @param key Public key used to verify the message
     * @param l1Address Address of the user on the L1 chain
     */
    function verify(
        L1Type l1Type,
        bytes calldata message,
        bytes calldata key,
        bytes calldata l1Address
    ) external view returns (bool, bytes memory);
}

address constant L1_MSG_VERIFY_ADDRESS = address(0x67);
IL1MsgVerify constant L1_MSG_VERIFY = IL1MsgVerify(L1_MSG_VERIFY_ADDRESS);
