const { accounts, contract } = require('@openzeppelin/test-environment');
const { expect }             = require('chai');

const Account      = contract.fromArtifact('Account');
const Proxy        = contract.fromArtifact('Proxy');
const ProxyFactory = contract.fromArtifact('ProxyFactory');

describe('ProxyFactory', async () =>
{
  const [ owner ] = accounts;

  beforeEach(async () =>
  {
    this.account      = await Account.new({ from: owner });
    this.proxyFactory = await ProxyFactory.new({ from: owner });
  });

  it('createProxy', async () =>
  {
    const receipt = await this.proxyFactory.createProxy(this.account.address, 1231006505, { from: owner });
    const proxy   = await Proxy.at(receipt.logs.filter(log => log.event === 'ProxyCreated')[0].args.proxy);
    expect(await proxy.implementation()).to.be.equal(this.account.address);
  });
});
