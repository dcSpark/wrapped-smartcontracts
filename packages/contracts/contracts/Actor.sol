// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import {ICardanoSigVerification} from "./ICardanoSigVerification.sol";

contract Actor {
    ICardanoSigVerification public immutable cardanoSigVerification =
        ICardanoSigVerification(address(0x66));

    string public mainchainAddress;

    uint256 public nonce;

    event Response(bool success, bytes data);

    constructor(string memory _mainchainAddress) {
        mainchainAddress = _mainchainAddress;
    }

    function execute(
        bytes calldata signature,
        bytes calldata key
    ) external returns (bool, bytes memory) {
        bool verified = cardanoSigVerification.verify(signature, key);

        require(verified, "Signature verification failed");

        string memory addressArg = cardanoSigVerification.getBech32AddressFromSign1(signature);

        require(
            keccak256(bytes(addressArg)) == keccak256(bytes(mainchainAddress)),
            "Address mismatch"
        );

        bytes memory txData = cardanoSigVerification.getPayloadFromSign1(signature);

        (uint256 txNonce, address to, uint256 value, bytes memory payload) = abi.decode(
            txData,
            (uint256, address, uint256, bytes)
        );

        require(txNonce == nonce, "Nonce mismatch");

        nonce++;

        (bool success, bytes memory responseData) = to.call{value: value}(payload);

        emit Response(success, responseData);

        return (success, responseData);
    }

    receive() external payable {}
}
