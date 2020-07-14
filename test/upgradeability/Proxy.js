const { accounts, contract, web3 } = require('@openzeppelin/test-environment');
const { BN, expectEvent }          = require('@openzeppelin/test-helpers');
const { expect }                   = require('chai');

const Account = contract.fromArtifact('Account');
const Proxy   = contract.fromArtifact('Proxy');

describe('Proxy', async () =>
{
  const [ owner ] = accounts;

  const zero  = new BN(0);
  const value = web3.utils.toWei('1', 'ether');

  beforeEach(async () =>
  {
    this.account      = await Account.new({ from: owner });
    this.proxy        = await Proxy.new(this.account.address, { from: owner });
    this.proxyAccount = await Account.at(this.proxy.address);
  });

  it('implementation', async () =>
  {
    expect(await this.proxy.implementation()).to.be.equal(this.account.address);
  });

  it('fallback', async () =>
  {
    await this.proxyAccount.initialize(owner);

    const data = this.account.contract.methods.execute(
      this.proxy.address,
      zero.toString(),
      this.account.contract.methods.update(owner).encodeABI(),
    ).encodeABI();

    await this.proxy.sendTransaction({
      from: owner,
      data: data,
    });
    expect(await this.proxy.implementation()).to.be.equal(owner);
  });

  it('receive', async () =>
  {
    const receipt = await this.proxy.sendTransaction({
      from:  owner,
      value: value,
    });
    expect(await web3.eth.getBalance(this.proxy.address)).to.be.equal(value);
    expectEvent(receipt, 'Received', {
      sender: owner,
      value: value,
      data: null,
    });
  });
});
