// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IUpbondDIDFactory {
  function createDID (  ) external;
  function createDIDForUser ( address user ) external;
  function owner (  ) external view returns ( address );
  function renounceOwnership (  ) external;
  function totalDID (  ) external view returns ( uint256 );
  function transferOwnership ( address newOwner ) external;
  function userDIDs ( address ) external view returns ( address );
}
