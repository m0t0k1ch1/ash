async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const ProxyFactory = await ethers.getContractFactory("ProxyFactory");
  const proxyFactory = await ProxyFactory.deploy();
  console.log("ProxyFactory address:", proxyFactory.address);

  const Account = await ethers.getContractFactory("Account");
  const account = await Account.deploy();
  console.log("Account address:", account.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
