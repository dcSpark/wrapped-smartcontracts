// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

contract Actor {
    bytes public txData;
    address public destinationContract;

    bool public executed;

    event Response(bool success, bytes data);

    modifier onlyOnce() {
        require(!executed, "Transaction was already executed");
        _;
        executed = true;
    }

    constructor(bytes memory _txData, address _destinationContract) {
        txData = _txData;
        destinationContract = _destinationContract;
    }

    function execute() public onlyOnce {
        (bool success, bytes memory data) = destinationContract.call(txData);
        emit Response(success, data);
    }
}
