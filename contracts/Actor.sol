// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

abstract contract Actor {
    bytes public _executeArgs;
    bytes public _executeConditionArgs;

    bool public executed;

    event Response(bytes response);

    modifier onlyOnce() {
        require(!executed, "Transaction was already executed");
        _;
        executed = true;
    }

    constructor(bytes memory executeArgs, bytes memory executeConditionArgs) {
        _executeArgs = executeArgs;
        _executeConditionArgs = executeConditionArgs;
    }

    function canExecute() public view returns (bool) {
        return executePredicate(_executeConditionArgs);
    }

    function execute() public onlyOnce {
        require(canExecute(), "Transaction condition not met");
        bytes memory response = executeCallback(_executeArgs);
        emit Response(response);
    }

    function executePredicate(bytes memory executeConditionArgs)
        public
        view
        virtual
        returns (bool);

    function executeCallback(bytes memory executeArgs) public virtual returns (bytes memory);
}
