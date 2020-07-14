const { accounts, contract }                   = require('@openzeppelin/test-environment');
const { constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect }                               = require('chai');

const { ZERO_ADDRESS } = constants;

const Owned = contract.fromArtifact('Owned');

describe('Owned', async () =>
{
  const [ owner, newOwner ] = accounts;

  beforeEach(async () =>
  {
    this.owned = await Owned.new({ from: owner });
  });

  it('initializeOwner', async () =>
  {
    expect(await this.owned.owner()).to.be.equal(ZERO_ADDRESS);

    const receipt = await this.owned.initializeOwner(owner, { from: owner });
    expect(await this.owned.owner()).to.be.equal(owner);
    expectEvent(receipt, 'OwnerChanged', { newOwner: owner });

    expectRevert(this.owned.initializeOwner(newOwner, { from: owner }), 'already initialized');
  });

  it('changeOwner', async () =>
  {
    await this.owned.initializeOwner(owner, { from: owner });

    expect(await this.owned.owner()).to.be.equal(owner);

    const receipt = await this.owned.changeOwner(newOwner, { from: owner });
    expect(await this.owned.owner()).to.be.equal(newOwner);
    expectEvent(receipt, 'OwnerChanged', { newOwner: newOwner });

    expectRevert(this.owned.changeOwner(owner, { from: owner }), 'must be owner');
  });
});
