const { accounts, contract }        = require('@openzeppelin/test-environment');
const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect }                    = require('chai');

const Owned = contract.fromArtifact('Owned');

describe('Owned', async () =>
{
  const [ owner, newOwner ] = accounts;

  beforeEach(async () =>
  {
    this.owned = await Owned.new({ from: owner });
  });

  it('changeOwner', async () =>
  {
    expect(await this.owned.owner()).to.be.equal(owner);

    const receipt = await this.owned.changeOwner(newOwner, { from: owner });
    expect(await this.owned.owner()).to.be.equal(newOwner);
    expectEvent(receipt, 'OwnerChanged', { newOwner: newOwner });

    expectRevert(this.owned.changeOwner(owner, { from: owner }), 'must be owner');
  });
});
