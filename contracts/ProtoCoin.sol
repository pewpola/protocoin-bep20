// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ProtoCoin is ERC20 {

    address private _owner;
    uint private _mintAmount = 0;

    constructor() ERC20("ProtoCoin", "PRC") {
        _owner = msg.sender;
        _mint(msg.sender, 1000 * 10 ** 18);
    }

    function mint() public {
        require(_mintAmount > 0, "Minting is not enabled");
        _mint(msg.sender, _mintAmount);
    }

    function setMintAmount(uint newAmount) public restricted {
        _mintAmount = newAmount;
    }

    modifier restricted {
        require(_owner == msg.sender, "You don't have permission.");
        _;
    }
}