// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

enum TokenType {
    INVALID,
    WMAIN,
    ERC20,
    ERC721,
    ERC1155
}

struct RegistryEntry {
    TokenType tokenType;
    address tokenContract;
    uint256 tokenId;
    uint256 minimumValue;
    uint8 mainChainDecimal;
}

struct UnwrappingRequest {
    bytes32 assetId;
    address from;
    bytes to;
    uint256 amount;
}

contract SidechainBridge {
    mapping(bytes32 => RegistryEntry) public tokenRegistry;
    uint256 public constant FEE = 1 ether;

    UnwrappingRequest[] public requests;

    constructor(IERC20[] memory tokens) {
        tokenRegistry[bytes32(0)] = RegistryEntry({
            tokenType: TokenType.WMAIN,
            tokenContract: address(0),
            tokenId: 0,
            minimumValue: 0,
            mainChainDecimal: 18
        });

        for (uint256 i = 0; i < tokens.length; i++) {
            bytes32 assetId = bytes32(uint256(uint160(address(tokens[i]))));
            tokenRegistry[assetId] = RegistryEntry({
                tokenType: TokenType.ERC20,
                tokenContract: address(tokens[i]),
                tokenId: 0,
                minimumValue: 0,
                mainChainDecimal: 18
            });
        }
    }

    function submitUnwrappingRequest(UnwrappingRequest calldata request) public payable {
        require(msg.value >= FEE, "Fee is not correct");

        RegistryEntry memory m1 = tokenRegistry[request.assetId];

        if (m1.tokenType == TokenType.WMAIN) {
            require(msg.value >= request.amount + FEE);
        } else if (m1.tokenType == TokenType.ERC20) {
            IERC20(m1.tokenContract).transferFrom(msg.sender, address(this), request.amount);
        }

        requests.push(request);

        console.log("Unwrapping request submitted");
    }
}
