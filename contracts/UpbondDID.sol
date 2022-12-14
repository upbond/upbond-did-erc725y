import "./ERC725/ERC725YCore.sol";
import "./abstract/str2bytes.sol";

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract UpbondDID is ERC725YCore, str2bytes {
    constructor(address newOwner) {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        OwnableUnset._setOwner(newOwner);
    }
}