// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

abstract contract Actor {
    bytes internal _payload;

    uint256 public emergencyWithdrawPossibleAt;

    bool public executed;

    event ExecuteResponse(bytes response);
    event WithdrawResponse(bytes response);

    modifier onlyOnce() {
        require(!executed, "Transaction was already executed");
        _;
        executed = true;
    }

    constructor(bytes memory payload, uint256 emergencyWithdrawalTimeout) {
        _payload = payload;

        emergencyWithdrawPossibleAt = block.number + emergencyWithdrawalTimeout;
    }

    /* Execution */
    function canExecute() public view returns (bool) {
        return executePredicate();
    }

    function execute() public onlyOnce {
        require(canExecute(), "Transaction condition not met");
        bytes memory response = executeCallback();
        emit ExecuteResponse(response);
    }

    function executePredicate() internal view virtual returns (bool);

    function executeCallback() internal virtual returns (bytes memory);

    /* Withdrawal */
    function canWithdraw() public view returns (bool) {
        return executed && withdrawPredicate();
    }

    function withdraw() public {
        require(canWithdraw(), "Withdrawal condition not mets");
        bytes memory response = withdrawCallback();
        emit WithdrawResponse(response);
    }

    function withdrawPredicate() internal view virtual returns (bool);

    function withdrawCallback() internal virtual returns (bytes memory);

    /* Emergency withdrawal */
    function canEmergencyWithdraw() public view returns (bool) {
        return block.number >= emergencyWithdrawPossibleAt;
    }

    function emergencyWithdraw() public {
        require(canEmergencyWithdraw(), "Emergency withdrawal not possible yet");
        bytes memory response = emergencyWithdrawCallback();
        emit WithdrawResponse(response);
    }

    function emergencyWithdrawCallback() internal virtual returns (bytes memory);

    receive() external payable {}
}
