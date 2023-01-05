import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IUpbondDID.sol";

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract UpbondDIDFactory is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    /**
     * @dev
     * 
     * mapping userDIDs will be read as function after deploy, to show address of user DID's
     * address _implementation is smartcontract address of user DID wil be clone
     */

    mapping (address => address) public userDIDs;

    address private _implementation;
    Counters.Counter private _totalDID;

    /**
     * @dev
     * 
     * event is log of smartcontract execution and should be used for offchain action
     */
    event createdDID(
        address indexed creator,
        address indexed did
    );

    /**
     * @dev
     * 
     * before deploy UpbondDIDFactory, make use deploy UpbondDID first to get address
     * and set as constructor parameter
     */
    constructor(address implementation) {
        _implementation = implementation;
    }
    
    /**
     * @dev
     * 
     * function createDID is self create upbond DID for caller
     */
    function createDID() external virtual nonReentrant {
        require(
            userDIDs[_msgSender()] == address(0),
            "UpbondDIDFactory : You`re already created DID!"
        );

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

    /**
     * @dev
     * 
     * function createDIDcreateDIDForUser is create upbond DID for target address
     * 
     * param :
     * 
     * address user is target of wallet address want to create did
     * 
     * note : using onlyOwner modifier (only factory owner should use this function)
     */
    function createDIDForUser(address user) external virtual onlyOwner nonReentrant {
        require(
            userDIDs[user] == address(0),
            "UpbondDIDFactory : User already have DID!"
        );

        uint256 currentIndex = totalDID();
        _totalDID.increment();

        bytes32 salt = bytes32(keccak256(abi.encode(currentIndex, user, address(this))));
        address did = Clones.cloneDeterministic(_implementation, salt);
        IUpbondDID(did).initialize(user);

        userDIDs[user] = did;

        emit createdDID(
            user,
            did
        );
    }

    /**
     * function totalDID is counting total did deployed
     */
    function totalDID() public view virtual returns(uint256) {
        return _totalDID.current();
    }
}