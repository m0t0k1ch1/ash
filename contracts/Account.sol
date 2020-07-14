// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.6.11;

import "./accessibility/Owned.sol";

contract Account is Owned
{
  event Executed(address indexed dest, uint256 value, bytes data);

  function execute(address dest, uint256 value, bytes calldata data) public onlyOwner returns (bytes memory)
  {
    (bool success, bytes memory result) = dest.call{ value: value }(data);
    if (!success) {
      assembly {
        returndatacopy(0, 0, returndatasize())
        revert(0, returndatasize())
      }
    }

    emit Executed(dest, value, data);

    return result;
  }
}
