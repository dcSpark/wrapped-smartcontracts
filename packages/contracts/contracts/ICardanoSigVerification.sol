// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface ICardanoSigVerification {
    function verify(bytes calldata signature, bytes calldata key) external view returns (bool);

    function getPayloadFromSign1(bytes calldata signature) external view returns (bytes memory);

    function getBech32AddressFromSign1(
        bytes calldata signature
    ) external view returns (string memory);
}
