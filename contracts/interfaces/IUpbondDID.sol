// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IUpbondDID {
  function fromBytes ( bytes memory _bytes ) external pure returns ( string memory );
  function fromBytes32 ( bytes32 _bytes32 ) external pure returns ( string memory );
  function getData ( bytes32[] memory dataKeys ) external view returns ( bytes[] memory dataValues );
  function getData ( bytes32 dataKey ) external view returns ( bytes memory dataValue );
  function getDataWithPermit ( address permitted, bytes32 dataKey, uint256 deadline, uint8 v, bytes32 r, bytes32 s ) external view returns ( bytes memory );
  function getDataWithPermit ( address permitted, bytes32[] memory dataKeys, uint256 deadline, uint8 v, bytes32 r, bytes32 s ) external view returns ( bytes[] memory );
  function initialize ( address newOwner ) external;
  function owner (  ) external view returns ( address );
  function renounceOwnership (  ) external;
  function setData ( bytes32[] memory dataKeys, bytes[] memory dataValues ) external;
  function setData ( bytes32 dataKey, bytes memory dataValue ) external;
  function supportsInterface ( bytes4 interfaceId ) external view returns ( bool );
  function toBytes ( string memory _string ) external pure returns ( bytes memory );
  function toBytes32 ( string memory _string ) external pure returns ( bytes32 );
  function transferOwnership ( address newOwner ) external;
}
