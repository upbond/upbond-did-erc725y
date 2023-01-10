import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "./ERC725/ERC725YInitAbstract.sol";
import "./abstract/str2bytes.sol";
import "./interfaces/IUpbondDIDFactory.sol";

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract UpbondDID is Context, EIP712Upgradeable, ERC725YInitAbstract, str2bytes {
    /**
     * @dev
     * 
     * _PERMIT_TYPEHASH is verificator for EIP712 signature
     * factory is address creator of contract
     */
    bytes32 private constant _PERMIT_TYPEHASH =
        keccak256("getDataWithPermit(address permitted,bytes32 dataKey,uint256 deadline)");

    address public factory;

    constructor() {
        /**
         * @dev
         * 
         * _disableInitializers() is used for real smartcontract to restrict call
         * initalize function after deploy and allowed use at clone
         */
        _disableInitializers();
    }

    /**
     * @dev
     * 
     * modifier onlyDIDManager for function rules, only DID owner and factory owner allowed do action
     */
    modifier onlyDIDManager {
        address factoryOwner = IUpbondDIDFactory(factory).owner();

        require(
            _msgSender() == owner() || _msgSender() == factoryOwner,
            "UpbondDID : You not allowed"
        );
        _;
    }

    /**
     * @dev
     * 
     * initialize function is used for initialize data of owner and factory DID,
     * this function is called once
     * 
     * param :
     * 
     * address newOwner is set owner of DID
     */
    function initialize(address newOwner) initializer external {
        __EIP712_init("Upbond DID", "1");

        ERC725YInitAbstract._initialize(newOwner);
        factory = _msgSender();
    }

    /**
     * @dev
     * 
     * getSigner function is used for checking signer address of signature
     * 
     * param :
     * 
     * address permitted is parameter for signature of address permitted get data
     * bytes32 dataKey is single key of data will be get
     * uint256 deadline is used for limit time validated of signature can used
     * uint8 v is splitted signature
     * bytes32 r is splitted siganture
     * bytes32 s is splitted signature
     */
    function getSigner(
        address permitted,
        bytes32 dataKey,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public view virtual returns (address) {
        require(block.timestamp <= deadline, "UpbondDID: expired deadline");

        bytes32 structHash = keccak256(abi.encode(_PERMIT_TYPEHASH, permitted, dataKey, deadline));
        bytes32 hash = _hashTypedDataV4(structHash);

        /**
         * @dev
         * 
         * using ECDSA library for recover signer address from signature
         * 
         * note : Return would be different if set wrong data
         */
        return ECDSAUpgradeable.recover(hash, v, r, s);
    }

    /**
     * @dev
     * 
     * function getDataWithPermit is get data of key, but must use valid DID owner signature for get data
     * 
     * param :
     * 
     * address permitted is parameter for signature of address permitted get data
     * bytes32 dataKey is single key of data will be get
     * uint256 deadline is used for limit time validated of signature can used
     * uint8 v is splitted signature
     * bytes32 r is splitted siganture
     * bytes32 s is splitted signature
     */
    function getDataWithPermit(
        address permitted,
        bytes32 dataKey,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public view virtual returns (bytes memory) {
        address signer = getSigner(permitted, dataKey, deadline, v, r, s);

        require(signer == owner(), "UpbondDID: invalid signature");
        
        return _getData(dataKey);
    }

    /**
     * @dev
     * 
     * function getDataWithPermit is get data of key, but must use valid DID owner signature for get data
     * 
     * param :
     * 
     * address permitted is parameter for signature of address permitted get data
     * bytes32[] memory dataKey is multiple key of data will be get
     * uint256 deadline is used for limit time validated of signature can used
     * uint8 v is splitted signature
     * bytes32 r is splitted siganture
     * bytes32 s is splitted signature
     */
    function getDataWithPermit(
        address permitted,
        bytes32[] memory dataKeys,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public view virtual returns (bytes[] memory) {
        bytes32 dataKey = keccak256(abi.encode(dataKeys));
        address signer = getSigner(permitted, dataKey, deadline, v, r, s);

        require(signer == owner(), "UpbondDID: invalid signature");
        
        bytes[] memory dataValues = new bytes[](dataKeys.length);

        for (uint256 i = 0; i < dataKeys.length; i = _uncheckedIncrementERC725Y(i)) {
            dataValues[i] = _getData(dataKeys[i]);
        }

        return dataValues;
    }
    
    /**
     * @dev
     * 
     * function setData is for save data of key, but developed unchangeable value
     * 
     * param :
     * 
     * bytes32 dataKey is single key of data will be set
     * bytes dataValue is single data will be set
     * 
     * note : using onlyDIDManager modifier
     */
    function setData(bytes32 dataKey, bytes memory dataValue) public virtual override onlyDIDManager {
        require(
            keccak256(_getData(dataKey)) == keccak256(new bytes(0)),
            "UpbondDID : This key already set!"
        );
        
        _setData(dataKey, dataValue);
    }

    /**
     * @dev
     * 
     * function setData is for save data of key, but developed unchangeable value
     * 
     * param :
     * 
     * bytes32[] memory dataKeys is multiple key of data will be set
     * bytes[] memory dataValues is multiple data will be set
     * 
     * note : using onlyDIDManager modifier
     */
    function setData(
        bytes32[] memory dataKeys,
        bytes[] memory dataValues
    ) public virtual override onlyDIDManager {
        for(uint256 a; a < dataValues.length; a++){
            require(
                keccak256(_getData(dataKeys[a])) == keccak256(new bytes(0)),
                "UpbondDID : This key already set!"
            );
        }

        for (uint256 i = 0; i < dataKeys.length; i = _uncheckedIncrementERC725Y(i)) {
            _setData(dataKeys[i], dataValues[i]);
        }
    }

    /**
     * @dev
     * 
     * function renounceOwnership is overriden renounceOwnership function from Ownable library
     * and action always reverted
     */
    function renounceOwnership() public override virtual {
        revert("UpbondDID : This function is overridden, ownable is not transferable!");
    }

    /**
     * @dev
     * 
     * function transferOwnership is overriden transferOwnership function from Ownable library
     * and action always reverted
     */
    function transferOwnership(address newOwner) public override virtual {
        // remove warning
        newOwner;

        revert("UpbondDID : This function is overridden, ownable is not transferable!");
    }

    /**
     * @dev
     * 
     * function getData is overriden getData function from ERC725YInitAbstract abstract contract
     * and action always reverted
     */
    function getData(bytes32 dataKey) public view virtual override returns (bytes memory dataValue) {
        // remove warning
        dataKey;
        dataValue;

        revert("UpbondDID : This function is overridden, use `getDataWithPermit` function!");
    }

    /**
     * @dev
     * 
     * function getData is overriden getData function from ERC725YInitAbstract abstract contract
     * and action always reverted
     */
    function getData(bytes32[] memory dataKeys) public view virtual override returns (bytes[] memory dataValues) {
        // remove warning
        dataKeys;
        dataValues;

        revert("UpbondDID : This function is overridden, use `getDataWithPermit` function!");
    }
}