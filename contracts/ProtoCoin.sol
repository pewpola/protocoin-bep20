// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ProtoCoin is ERC20 {

    address private _owner;
    uint private _mintAmount = 0;
    uint64 private _mintDelay = 60 * 60 * 24;

    mapping (address => uint256) private nextMint;

    constructor() ERC20("ProtoCoin", "PRC") {
        _owner = msg.sender;
        _mint(msg.sender, 10000000 * 10 ** 18);
    }

    function mint(address to) public restricted {
        require(_mintAmount > 0, "Minting is not enabled");
        require(block.timestamp > nextMint[to], "You cannot mint twice in a row.");
        _mint(to, _mintAmount);
        nextMint[to] = block.timestamp + _mintDelay;
    }

    function setMintAmount(uint256 newAmount) public restricted {
        _mintAmount = newAmount;
    }

    function setMintDelay(uint64 newDelayInSeconds) public restricted {
        _mintAmount = newDelayInSeconds;
    }

    modifier restricted {
        require(_owner == msg.sender, "You don't have permission.");
        _;
    }
}
