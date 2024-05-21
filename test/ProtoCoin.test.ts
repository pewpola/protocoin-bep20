import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
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
    expect(totalSupply).to.equal(10000000n * 10n ** 18n);
  });

  it("Should get balance", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const balance = await protoCoin.balanceOf(owner.address);
    expect(balance).to.equal(10000000n * 10n ** 18n);
  });

  it("Should transfer", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployFixture);
    const ownerBalanceBeforeTransfer = await protoCoin.balanceOf(owner.address);
    const otherAccountBalanceBeforeTransfer = await protoCoin.balanceOf(otherAccount.address);

    await protoCoin.transfer(otherAccount.address, 5n);

    const ownerBalanceAfterTransfer = await protoCoin.balanceOf(owner.address);
    const otherAccountBalanceAfterTransfer = await protoCoin.balanceOf(otherAccount.address);

    expect(ownerBalanceBeforeTransfer).to.equal(10000000n * 10n ** 18n);
    expect(ownerBalanceAfterTransfer).to.equal((10000000n * 10n ** 18n) - 5n);
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

    expect(ownerBalanceBeforeTransfer).to.equal(10000000n * 10n ** 18n);
    expect(ownerBalanceAfterTransfer).to.equal((10000000n * 10n ** 18n) - 5n);
    expect(otherAccountBalanceBeforeTransfer).to.equal(0);
    expect(otherAccountBalanceAfterTransfer).to.equal(5);
    expect(allowance).to.equal(5);
  });

  it("Should NOT transfer from (insufficient balance)", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployFixture);

    const instance = protoCoin.connect(otherAccount);
    await instance.approve(owner.address, 1n);

    await expect(protoCoin.transferFrom(otherAccount.address, owner.address, 1n)).to.be.revertedWithCustomError(protoCoin, "ERC20InsufficientBalance");
  });

  it("Should NOT transfer from (insufficient allowance)", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployFixture);

    const instance = protoCoin.connect(otherAccount);

    await expect(instance.transferFrom(owner.address, otherAccount.address, 1n)).to.be.revertedWithCustomError(protoCoin, "ERC20InsufficientAllowance");
  });

  it("Should mint once", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployFixture);

    const mintAmount = 1000n;
    await protoCoin.setMintAmount(mintAmount);

    const otherAccountBalanceBefore = await protoCoin.balanceOf(otherAccount);

    await protoCoin.mint(otherAccount.address);

    const otherAccountBalanceAfter = await protoCoin.balanceOf(otherAccount);

    expect(otherAccountBalanceAfter).to.equal(otherAccountBalanceBefore + mintAmount);
  });

  it("Should mint twice (different accounts)", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployFixture);

    const mintAmount = 1000n;
    await protoCoin.setMintAmount(mintAmount);

    const ownerBalanceBefore = await protoCoin.balanceOf(owner.address);
    await protoCoin.mint(owner.address);

    await protoCoin.mint(otherAccount.address);

    const ownerBalanceAfter = await protoCoin.balanceOf(owner.address);

    expect(ownerBalanceAfter).to.equal(ownerBalanceBefore + mintAmount);
  });

  it("Should mint twice (different moments)", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployFixture);

    const mintAmount = 1000n;
    await protoCoin.setMintAmount(mintAmount);

    const ownerBalanceBefore = await protoCoin.balanceOf(otherAccount.address);
    await protoCoin.mint(otherAccount.address);

    const mintDelay = 60 * 60 * 24 * 2;
    await time.increase(mintDelay);

    await protoCoin.mint(otherAccount.address);

    const ownerBalanceAfter = await protoCoin.balanceOf(otherAccount.address);

    expect(ownerBalanceAfter).to.equal(ownerBalanceBefore + (mintAmount * 2n));
  });

  it("Should NOT set mint amount", async function () {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployFixture);

    const mintAmount = 1000n;
    const instance = protoCoin.connect(otherAccount);

    expect(instance.setMintAmount(mintAmount)).to.be.revertedWith("You don't have permission.");
  });

  it("Should NOT set mint delay", async function() {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployFixture);

    const mintDelay = 60 * 60 * 24;
    const instance = protoCoin.connect(otherAccount);

    expect(instance.setMintDelay(mintDelay)).to.be.revertedWith("You don't have permission.");
  });

  it("Should NOT mint", async function() {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployFixture);

    expect(protoCoin.mint(otherAccount.address)).to.be.revertedWith("Minting is not enabled");
  });

  it("Should NOT mint twice", async function() {
    const { protoCoin, owner, otherAccount } = await loadFixture(deployFixture);

    await protoCoin.setMintAmount(1000n);

    await protoCoin.mint(otherAccount.address);
    
    expect(protoCoin.mint(otherAccount.address)).to.be.revertedWith("You cannot mint twice in a row.");
  });
});