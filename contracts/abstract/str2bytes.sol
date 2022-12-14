// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

abstract contract str2bytes {
    function toBytes(string memory _string) public pure returns(bytes memory) {
        return bytes(_string);
    }

    function toBytes32(string memory _string) public pure returns(bytes32) {
        bytes32 res;

        assembly {
            res := mload(add(_string, 32))
        }

        return res;
    }

    function fromBytes(bytes memory _bytes) public pure returns(string memory) {
        return string(_bytes);
    }

    function fromBytes32(bytes32 _bytes32) public pure returns(string memory) {
        bytes memory res = new bytes(32);

        for (uint256 i; i < 32; i++) {
            res[i] = _bytes32[i];
        }

        return string(res);
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[49] private __gap;
}