const { expect } = require("chai");

describe("ProxyFactory contract", () => {
  let ProxyFactory;
  let Proxy;
  let Account;

  let proxyFactory;
  let account;

  let accountOwner;

  beforeEach(async () => {
    ProxyFactory = await ethers.getContractFactory("ProxyFactory");
    Proxy = await ethers.getContractFactory("TransparentUpgradeableProxy");
    Account = await ethers.getContractFactory("Account");

    proxyFactory = await ProxyFactory.deploy();
    account = await Account.deploy();

    [accountOwner] = await ethers.getSigners();
  });

  describe("tx", () => {
    it("createProxy: success", async () => {
      const impl = account.address;
      const salt = ethers.utils.randomBytes(32);
      const data = account.interface.encodeFunctionData("init", [
        accountOwner.address,
      ]);

      expect(
        await proxyFactory.createProxy(impl, accountOwner.address, data, salt)
      )
        .to.emit(proxyFactory, "ProxyCreated")
        .withArgs(
          ethers.utils.getCreate2Address(
            proxyFactory.address,
            salt,
            ethers.utils.keccak256(
              ethers.utils.concat([
                Proxy.bytecode,
                ethers.utils.defaultAbiCoder.encode(
                  ["address", "address", "bytes"],
                  [impl, accountOwner.address, data]
                ),
              ])
            )
          )
        );
    });
  });
});
