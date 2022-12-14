import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IUpbondDID.sol";

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract UpbondDIDFactory is Context, ReentrancyGuard {
    using Counters for Counters.Counter;

    mapping (address => address) public userDIDs;

    address private _implementation;
    Counters.Counter private _totalDID;

    event createdDID(
        address indexed creator,
        address indexed did
    );

    constructor(address implementation) {
        _implementation = implementation;
    }
    
    function createDID() external virtual nonReentrant {
        uint256 currentIndex = totalDID();
        _totalDID.increment();

        bytes32 salt = bytes32(keccak256(abi.encode(currentIndex, _msgSender(), address(this))));
        address did = Clones.cloneDeterministic(_implementation, salt);
        IUpbondDID(did).initialize(_msgSender());

        userDIDs[_msgSender()] = did;

        emit createdDID(
            _msgSender(),
            did
        );
    }

    function totalDID() public view virtual returns(uint256) {
        return _totalDID.current();
    }
}