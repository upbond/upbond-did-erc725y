import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import "./ERC725/ERC725YInitAbstract.sol";
import "./abstract/str2bytes.sol";

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract UpbondDID is EIP712Upgradeable, ERC725YInitAbstract, str2bytes {
    bytes32 private constant _PERMIT_TYPEHASH =
        keccak256("getDataWithPermit(address permitted,bytes32 dataKey,uint256 deadline)");

    constructor() {
        _disableInitializers();
    }

    function initialize(address newOwner) initializer external {
        __EIP712_init("Upbond DID", "1");

        ERC725YInitAbstract._initialize(newOwner);
    }

    function getDataWithPermit(
        address permitted,
        bytes32 dataKey,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public view virtual returns (bytes memory) {
        require(block.timestamp <= deadline, "UpbondDID: expired deadline");

        bytes32 structHash = keccak256(abi.encode(_PERMIT_TYPEHASH, permitted, dataKey, deadline));
        bytes32 hash = _hashTypedDataV4(structHash);

        address signer = ECDSAUpgradeable.recover(hash, v, r, s);

        require(signer == owner(), "UpbondDID: invalid signature");
        
        return _getData(dataKey);
    }

    function getDataWithPermit(
        address permitted,
        bytes32[] memory dataKeys,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public view virtual returns (bytes[] memory) {
        require(block.timestamp <= deadline, "UpbondDID: expired deadline");

        bytes32 dataKey = keccak256(abi.encode(dataKeys));
        bytes32 structHash = keccak256(abi.encode(_PERMIT_TYPEHASH, permitted, dataKey, deadline));
        bytes32 hash = _hashTypedDataV4(structHash);

        address signer = ECDSAUpgradeable.recover(hash, v, r, s);

        require(signer == owner(), "UpbondDID: invalid signature");
        
        bytes[] memory dataValues = new bytes[](dataKeys.length);

        for (uint256 i = 0; i < dataKeys.length; i = _uncheckedIncrementERC725Y(i)) {
            dataValues[i] = _getData(dataKeys[i]);
        }

        return dataValues;
    }

    function renounceOwnership() public override virtual {
        revert("UpbondDID : This function is overridden, ownable is not transferable!");
    }

    function transferOwnership(address newOwner) public override virtual {
        // remove warning
        newOwner;

        revert("UpbondDID : This function is overridden, ownable is not transferable!");
    }

    function getData(bytes32 dataKey) public view virtual override returns (bytes memory dataValue) {
        // remove warning
        dataKey;
        dataValue;

        revert("UpbondDID : This function is overridden, use `getDataWithPermit` function!");
    }

    function getData(bytes32[] memory dataKeys) public view virtual override returns (bytes[] memory dataValues) {
        // remove warning
        dataKeys;
        dataValues;

        revert("UpbondDID : This function is overridden, use `getDataWithPermit` function!");
    }
}