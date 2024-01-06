// This is a unit test file so sinon, and chai are dev-dependencies
/* eslint-disable import/no-extraneous-dependencies */
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe, it, beforeEach } from 'mocha';
import AdtMockTestContext from './AdtMockTestContext';
import DecommissionModelSteps from './DecommissionModels.steps';

// use chaiAsPromised to handle async calls
chai.use(chaiAsPromised);
const { expect } = chai;

describe('When decommissioning models by version number', () => {
  let ctx: AdtMockTestContext;
  let steps: DecommissionModelSteps;

  beforeEach(() => {
    ctx = new AdtMockTestContext();
    steps = new DecommissionModelSteps(ctx);
  });

  it('given models with dependencies exist for given version number', async () => {
    // Arrange
    const modelsToDecommission = steps.arrangeModelsWithVersionExist();

    // Act
    await ctx.modelService.decommissionModelsByVersion('');

    // Assert
    steps.assertModelsDecommissionedInOrder(modelsToDecommission);
  });

  it('given cli was called with dryrun option', async () => {
    // Arrange
    steps.arrangeModelsWithVersionExist();

    // Act
    await ctx.modelService.decommissionModelsByVersion('unused', true);

    // Assert
    expect(ctx.digitalTwinsClient.decomissionModel.notCalled, 'should not call decommission on a dry-run')
      .to.be.true;
  });

  it('ADT listModels rejects', async () => {
    // Arrange
    steps.arrangeListModelsRejects();

    // Act/Assert
    await expect(ctx.modelService.decommissionModelsByVersion('unused'),
      'should reject if listModels rejects').to.be.rejected;
    expect(ctx.digitalTwinsClient.decomissionModel.notCalled,
      'should not call decommission if listModels rejects').to.be.true;
  });
});

describe('When decommissioning a model by Id', () => {
  let ctx: AdtMockTestContext;
  let steps: DecommissionModelSteps;

  beforeEach(() => {
    ctx = new AdtMockTestContext();
    steps = new DecommissionModelSteps(ctx);
  });

  it('Given a valid model id is provided', async () => {
    // Arrange
    const modelId = 'testId';

    // Act
    await ctx.modelService.decommissionModelById(modelId);

    // Assert
    expect(ctx.digitalTwinsClient.decomissionModel.calledOnceWith(modelId),
      'should call adt decommission with the provided modelId').to.be.true;
  });

  it('Given that ADT listModels rejects', async () => {
    // Arrange
    steps.arrangeDecommissionModelRejects();

    // Act/Assert
    await expect(ctx.modelService.decommissionModelById('unused'),
      'should reject if listModels rejects').to.be.rejected;
  });
});
