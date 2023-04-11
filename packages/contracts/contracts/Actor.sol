// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IL1MsgVerify, L1_MSG_VERIFY} from "./IL1MsgVerify.sol";

/**
 * @dev This contract is an account abstraction tied to the specific l1 chain address 'mainchainAddress'.
 *
 * Anyone can call 'execute' with a signed transaction data and a key to verify the signature.
 *
 * keccak256('tx.gasLimit') is the storage slot used to store initial gas limit at the beginning of contract bytecode.
 */
contract Actor {
    uint256 private constant G_TRANSACTION = 21000;
    uint256 private constant G_TX_DATA_NONZERO = 68;
    uint256 private constant G_TX_DATA_ZERO = 4;
    uint256 private constant G_GAS_OPCODE = 2;
    uint256 private constant G_REFUND_CALL = 6800;
    uint256 private constant G_REFUND_OVERHEAD = 836;
    uint256 private constant G_REFUND_RESERVE = 15_000;

    address private actorFactory;

    string public mainchainAddress;

    uint256 public nonce;

    event Response(bool success);

    constructor(string memory _mainchainAddress) {
        require(bytes(_mainchainAddress).length > 0, "Invalid mainchain address");
        mainchainAddress = _mainchainAddress;
        actorFactory = msg.sender;
    }

    /**
     * @dev The logic to store tx.gasLimit is injected at the beginning of the contract bytecode mid compilation.
     */
    function getProvidedGasLimit() internal view returns (uint256) {
        uint256 remainingGasLimit;
        bytes32 storageSlot = keccak256("tx.gasLimit");

        assembly {
            remainingGasLimit := sload(storageSlot)
        }

        return remainingGasLimit + G_GAS_OPCODE;
    }

    function getIntrinsicGas() internal pure returns (uint256) {
        uint256 intrinsicGas = G_TRANSACTION;

        for (uint256 i = 0; i < msg.data.length; i++) {
            intrinsicGas += msg.data[i] == 0 ? G_TX_DATA_ZERO : G_TX_DATA_NONZERO;
        }

        return intrinsicGas;
    }

    function execute(bytes calldata signature, bytes calldata key) external {
        // First transaction can be executed by factory with `deployAndExecute`
        require(
            (nonce == 0 && msg.sender == actorFactory) || msg.sender == tx.origin,
            "Only factory or EOA can execute"
        );

        uint256 providedGasLimit = getProvidedGasLimit();
        uint256 intrinsicGas = getIntrinsicGas();

        uint256 txGasLimit = providedGasLimit + intrinsicGas;

        (bool verified, bytes memory txData) = L1_MSG_VERIFY.verify(
            IL1MsgVerify.L1Type.Cardano,
            signature,
            key,
            bytes(mainchainAddress)
        );

        require(verified, "Signature verification failed");

        (
            address from,
            uint256 txNonce,
            address to,
            uint256 value,
            uint256 signedGasLimit,
            uint256 gasPrice,
            bytes memory payload
        ) = abi.decode(txData, (address, uint256, address, uint256, uint256, uint256, bytes));

        require(from == address(this), "From mismatch");
        require(
            signedGasLimit == txGasLimit || (nonce == 0 && signedGasLimit == providedGasLimit),
            "Gas limit mismatch"
        );
        require(gasPrice == tx.gasprice, "Gas price mismatch");

        require(to != address(0), "To address cannot be zero");

        require(txNonce == nonce, "Nonce mismatch");

        nonce++;

        // Leave enough gas for refund
        (bool destCallSuccess, ) = to.call{value: value, gas: gasleft() - G_REFUND_RESERVE}(
            payload
        );

        emit Response(destCallSuccess);

        // G_REFUND_OVERHEAD is an adhoc solution to calculate precise refund
        // should be changed in future to calculate precise gas usage of the transfer
        uint256 gasUsed = txGasLimit - gasleft() + G_REFUND_CALL + G_REFUND_OVERHEAD;

        (bool refundSuccess, ) = payable(tx.origin).call{value: gasUsed * tx.gasprice}("");

        require(refundSuccess);
    }

    receive() external payable {}
}
