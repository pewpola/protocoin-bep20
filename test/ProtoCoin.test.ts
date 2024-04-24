import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("ProtoCoin", function () {
  async function deployFixture() {

    const [owner, otherAccount] = await hre.ethers.getSigners();

    const ProtoCoin = await hre.ethers.getContractFactory("ProtoCoin");
    const protoCoin = await ProtoCoin.deploy();

    return { protoCoin, owner, otherAccount };
  }

  it("Should have correct name", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const name = await protoCoin.name();
    expect(name).to.equal("ProtoCoin");
  });

  it("Should have corrent symbol", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const symbol = await protoCoin.symbol();
    expect(symbol).to.equal("PRC");
  });

  it("Should have correct decimals", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const decimals = await protoCoin.decimals();
    expect(decimals).to.equal(18);
  });

  it("Should have correct total supply", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const totalSupply = await protoCoin.totalSupply();
    expect(totalSupply).to.equal(1000n * 10n ** 18n);
  });

  it("Should get balance", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const balance = await protoCoin.balanceOf(owner.address);
    expect(balance).to.equal(1000n * 10n ** 18n);
  });

  it("Should transfer", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const ownerBalanceBeforeTransfer = await protoCoin.balanceOf(owner.address);
    const otherAccountBalanceBeforeTransfer = await protoCoin.balanceOf(otherAccount.address);

    await protoCoin.transfer(otherAccount.address, 5n);

    const ownerBalanceAfterTransfer = await protoCoin.balanceOf(owner.address);
    const otherAccountBalanceAfterTransfer = await protoCoin.balanceOf(otherAccount.address);

    expect(ownerBalanceBeforeTransfer).to.equal(1000n * 10n ** 18n);
    expect(ownerBalanceAfterTransfer).to.equal((1000n * 10n ** 18n) - 5n);
    expect(otherAccountBalanceBeforeTransfer).to.equal(0);
    expect(otherAccountBalanceAfterTransfer).to.equal(5);
  });

  it("Should NOT transfer", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const instance = protoCoin.connect(otherAccount)
    await expect(instance.transfer(owner.address, 1n)).to.be.revertedWithCustomError(protoCoin, "ERC20InsufficientBalance");
  });

  it("Should approve", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    await protoCoin.approve(otherAccount.address, 1n);  

    const value = await protoCoin.allowance(owner.address, otherAccount.address);
    expect(value).to.equal(1n);
  });

  it("Should transfer from", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const ownerBalanceBeforeTransfer = await protoCoin.balanceOf(owner.address);
    const otherAccountBalanceBeforeTransfer = await protoCoin.balanceOf(otherAccount.address);
    
    await protoCoin.approve(otherAccount.address, 10n);

    const instance = protoCoin.connect(otherAccount);
    await instance.transferFrom(owner.address, otherAccount.address, 5n);

    const ownerBalanceAfterTransfer = await protoCoin.balanceOf(owner.address);
    const otherAccountBalanceAfterTransfer = await protoCoin.balanceOf(otherAccount.address);
    const allowance = await protoCoin.allowance(owner.address, otherAccount.address);

    expect(ownerBalanceBeforeTransfer).to.equal(1000n * 10n ** 18n);
    expect(ownerBalanceAfterTransfer).to.equal((1000n * 10n ** 18n) - 5n);
    expect(otherAccountBalanceBeforeTransfer).to.equal(0);
    expect(otherAccountBalanceAfterTransfer).to.equal(5);
    expect(allowance).to.equal(5);
  });

  it("Should NOT transfer from (insufficient balance)", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const instance = protoCoin.connect(otherAccount)
    await expect(instance.transferFrom(otherAccount.address, owner.address, 1n)).to.be.revertedWithCustomError(protoCoin, "ERC20InsufficientBalance");
  });

  it("Should NOT transfer from (insufficient allowance)", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const instance = protoCoin.connect(otherAccount)
    await expect(instance.transferFrom(owner.address, otherAccount.address, 1n)).to.be.revertedWithCustomError(protoCoin, "ERC20InsufficientAllowance");
  });
});