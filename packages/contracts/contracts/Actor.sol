// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ICardanoSigVerification} from "./ICardanoSigVerification.sol";

contract Actor {
    uint256 private constant G_TRANSACTION = 21000;
    uint256 private constant G_TX_DATA_NONZERO = 68;
    uint256 private constant G_TX_DATA_ZERO = 4;
    uint256 private constant G_GAS_OPCODE = 2;
    uint256 private constant G_REFUND_CALL = 6800;
    uint256 private constant G_REFUND_OVERHEAD = 803;
    uint256 private constant G_REFUND_RESERVE = 15_000;

    ICardanoSigVerification public constant cardanoSigVerification =
        ICardanoSigVerification(address(0x66));

    address private actorFactory;

    string public mainchainAddress;

    uint256 public nonce;

    event Response(bool success, bytes responseData);
    event LogInt(uint256 value);

    constructor(string memory _mainchainAddress) {
        mainchainAddress = _mainchainAddress;
        actorFactory = msg.sender;
    }

    function getGasLimit() internal view returns (uint256) {
        uint256 remainingGasLimit;
        bytes32 storageSlot = keccak256("tx.gasLimit");

        assembly {
            remainingGasLimit := sload(storageSlot)
        }

        uint256 intrinsicGas = G_TRANSACTION + G_GAS_OPCODE;

        for (uint256 i = 0; i < msg.data.length; i++) {
            intrinsicGas += msg.data[i] == 0 ? G_TX_DATA_ZERO : G_TX_DATA_NONZERO;
        }

        return intrinsicGas + remainingGasLimit;
    }

    function execute(bytes calldata signature, bytes calldata key) external {
        require(nonce == 0 || msg.sender == tx.origin, "Only factory or EOA can execute");

        uint256 providedGasLimit = getGasLimit();

        bool verified = cardanoSigVerification.verify(signature, key);

        require(verified, "Signature verification failed");

        string memory addressArg = cardanoSigVerification.getBech32AddressFromSign1(signature);

        require(
            keccak256(bytes(addressArg)) == keccak256(bytes(mainchainAddress)),
            "Address mismatch"
        );

        bytes memory txData = cardanoSigVerification.getPayloadFromSign1(signature);

        (
            uint256 txNonce,
            address to,
            uint256 value,
            uint256 txGasLimit,
            uint256 gasPrice,
            bytes memory payload
        ) = abi.decode(txData, (uint256, address, uint256, uint256, uint256, bytes));

        require(txGasLimit == providedGasLimit || msg.sender != tx.origin, "Gas limit mismatch");
        require(gasPrice == tx.gasprice, "Gas price mismatch");

        require(txNonce == nonce, "Nonce mismatch");

        nonce++;

        (bool success, bytes memory responseData) = to.call{
            value: value,
            gas: gasleft() - G_REFUND_RESERVE
        }(payload);

        emit Response(success, responseData);

        uint256 gasUsed = providedGasLimit - gasleft() + G_REFUND_CALL + G_REFUND_OVERHEAD;

        payable(tx.origin).transfer(gasUsed * tx.gasprice);
    }

    receive() external payable {}
}
