// This is a unit test file so sinon, and chai are dev-dependencies
/* eslint-disable import/no-extraneous-dependencies */
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe, it, beforeEach } from 'mocha';
import AdtMockTestContext from './AdtMockTestContext';
import DeleteModelSteps from './DeleteModels.steps';

// use chaiAsPromised to handle async calls
chai.use(chaiAsPromised);
const { expect } = chai;

describe('When deleting a model by id', () => {
  let ctx: AdtMockTestContext;
  let steps: DeleteModelSteps;

  beforeEach(() => {
    ctx = new AdtMockTestContext();
    steps = new DeleteModelSteps(ctx);
  });

  it('Given a valid modelId provided', async () => {
    // Arrange
    const modelId = 'testId';

    // Act
    await ctx.modelService.deleteModelById(modelId);

    // Assert
    expect(ctx.digitalTwinsClient.deleteModel.calledOnceWith(modelId),
      'should call adt deleteModel with the provided modelId').to.be.true;
  });

  it('Given a model with provided id does not exist', async () => {
    // Arrange
    const modelId = 'badId';
    steps.arrangeDeleteModelRejects(modelId);

    // Act/Assert
    await expect(ctx.modelService.deleteModelById(modelId),
      'should reject if model does not exist in ADT').to.be.rejected;
  });
});

describe('When deleting a model batch by id list', () => {
  let ctx: AdtMockTestContext;
  let steps: DeleteModelSteps;

  beforeEach(() => {
    ctx = new AdtMockTestContext();
    steps = new DeleteModelSteps(ctx);
  });

  it('Given ids of valid models with dependencies provided', async () => {
    // Arrange
    const modelsToDelete = steps.arrangeModelsExistWithDependencies();

    // Act
    await steps.actDeleteModelBatch(modelsToDelete);

    // Assert
    steps.assertModelsDeletedInOrder(modelsToDelete);
  });

  it('Given the operation was called with dryrun option', async () => {
    // Arrange
    const modelsToDelete = steps.arrangeModelsExistWithDependencies();

    // Act
    await steps.actDeleteModelBatch(modelsToDelete, true);

    // Assert
    expect(ctx.digitalTwinsClient.deleteModel.notCalled, 'should not call delete on a dry-run')
      .to.be.true;
  });

  it('Given ADT listModels rejects', async () => {
    // Arrange
    steps.arrangeListModelsRejects();

    // Act/Assert
    await expect(ctx.modelService.deleteModelBatchByIds([]),
      'should reject if listModels rejects').to.be.rejected;
    expect(ctx.digitalTwinsClient.deleteModel.notCalled,
      'should not call delete if listModels rejects').to.be.true;
  });
});

describe('When deleting all models', () => {
  let ctx: AdtMockTestContext;
  let steps: DeleteModelSteps;

  beforeEach(() => {
    ctx = new AdtMockTestContext();
    steps = new DeleteModelSteps(ctx);
  });

  it('Given valid models with dependencies exist', async () => {
    // Arrange
    const modelsToDelete = steps.arrangeModelsExistWithDependenciesGetAll();

    // Act
    await ctx.modelService.deleteAllModels();

    // Assert
    steps.assertModelsDeletedInOrder(modelsToDelete);
  });

  it('Given the operation was called with dryrun option', async () => {
    // Arrange
    steps.arrangeModelsExistWithDependenciesGetAll();

    // Act
    await ctx.modelService.deleteAllModels(true);

    // Assert
    expect(ctx.digitalTwinsClient.deleteModel.notCalled, 'should not call delete on a dry-run')
      .to.be.true;
  });

  it('Given ADT listModels rejects', async () => {
    // Arrange
    steps.arrangeListModelsRejects();

    // Act/Assert
    await expect(ctx.modelService.deleteAllModels(),
      'should reject if listModels rejects').to.be.rejected;
    expect(ctx.digitalTwinsClient.deleteModel.notCalled,
      'should not call delete if listModels rejects').to.be.true;
  });
});

describe('When deleting models by version', () => {
  let ctx: AdtMockTestContext;
  let steps: DeleteModelSteps;

  beforeEach(() => {
    ctx = new AdtMockTestContext();
    steps = new DeleteModelSteps(ctx);
  });

  it('Given valid models with given version exist', async () => {
    // Arrange
    const modelsToDelete = steps.arrangeModelsWithVersionExist();

    // Act
    await ctx.modelService.deleteModelsByVersion('unused');

    // Assert
    steps.assertModelsDeletedInOrder(modelsToDelete);
  });

  it('Given the operation was called called with dryrun option', async () => {
    // Arrange
    steps.arrangeModelsWithVersionExist();

    // Act
    await ctx.modelService.deleteModelsByVersion('unused', true);

    // Assert
    expect(ctx.digitalTwinsClient.deleteModel.notCalled, 'should not call delete on a dry-run')
      .to.be.true;
  });

  it('Given ADT listModels rejects', async () => {
    // Arrange
    steps.arrangeListModelsRejects();

    // Act/Assert
    await expect(ctx.modelService.deleteModelsByVersion('unused'),
      'should reject if listModels rejects').to.be.rejected;
    expect(ctx.digitalTwinsClient.deleteModel.notCalled,
      'should not call delete if listModels rejects').to.be.true;
  });
});
