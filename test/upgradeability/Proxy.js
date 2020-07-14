const { accounts, contract, web3 } = require('@openzeppelin/test-environment');
const { expectEvent }              = require('@openzeppelin/test-helpers');
const { expect }                   = require('chai');

const Account = contract.fromArtifact('Account');
const Proxy   = contract.fromArtifact('Proxy');

describe('Proxy', async () =>
{
  const [ owner ] = accounts;

  const value = web3.utils.toWei('1', 'ether');

  beforeEach(async () =>
  {
    this.impl  = await Account.new({ from: owner });
    this.proxy = await Proxy.new(this.impl.address, { from: owner });
  });

  it('implementation', async () =>
  {
    expect(await this.proxy.implementation()).to.be.equal(this.impl.address);
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
