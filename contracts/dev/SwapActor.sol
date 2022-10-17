// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Actor} from "../Actor.sol";
import {SimpleSwap} from "./SimpleSwap.sol";
import {SidechainBridge, UnwrappingRequest} from "./SidechainBridge.sol";

contract SwapActor is Actor {
    struct Payload {
        SimpleSwap swapContract;
        SidechainBridge bridge;
        IERC20 desiredToken;
        bytes32 assetId;
        bytes mainchainAddress;
        uint256 amount;
        uint256 unwrapFee;
    }

    constructor(bytes memory payload, uint256 emergencyWithdrawalTimeout)
        Actor(payload, emergencyWithdrawalTimeout)
    {}

    function executePredicate() internal view override returns (bool) {
        Payload memory p = _getPayload();
        return address(this).balance >= p.amount + p.unwrapFee;
    }

    function executeCallback() internal override returns (bytes memory) {
        Payload memory p = _getPayload();

        p.swapContract.swap{value: p.amount}(p.desiredToken);

        return abi.encode(true);
    }

    function withdrawPredicate() internal view override returns (bool) {
        Payload memory p = _getPayload();

        return
            p.desiredToken.balanceOf(address(this)) >= p.amount &&
            address(this).balance >= p.unwrapFee;
    }

    function withdrawCallback() internal override returns (bytes memory) {
        Payload memory p = _getPayload();

        p.desiredToken.approve(address(p.bridge), p.amount);

        p.bridge.submitUnwrappingRequest{value: p.unwrapFee}(
            UnwrappingRequest({
                assetId: p.assetId,
                from: address(this),
                to: p.mainchainAddress,
                amount: p.amount
            })
        );

        return abi.encode(true);
    }

    function emergencyWithdrawCallback() internal override returns (bytes memory) {
        Payload memory p = _getPayload();

        uint256 amount = address(this).balance;

        p.bridge.submitUnwrappingRequest{value: amount}(
            UnwrappingRequest({
                assetId: bytes32(0),
                from: address(this),
                to: p.mainchainAddress,
                amount: amount - p.unwrapFee
            })
        );

        return abi.encode(true);
    }

    function _getPayload() private view returns (Payload memory) {
        return abi.decode(_payload, (Payload));
    }
}
