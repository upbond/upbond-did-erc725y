import "./ERC725/ERC725XCore.sol";
import "./ERC725/ERC725YCore.sol";
import "./abstract/str2bytes.sol";

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract UpbondDID is ERC725XCore, ERC725YCore, str2bytes {
    constructor(address newOwner) {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        OwnableUnset._setOwner(newOwner);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC725XCore, ERC725YCore)
        returns (bool)
    {
        return
            interfaceId == _INTERFACEID_ERC725X ||
            interfaceId == _INTERFACEID_ERC725Y ||
            super.supportsInterface(interfaceId);
    }
}