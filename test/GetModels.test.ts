// This is a unit test file so sinon, and chai are dev-dependencies
/* eslint-disable import/no-extraneous-dependencies */
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe, it, beforeEach } from 'mocha';
import AdtMockTestContext from './AdtMockTestContext';
import GetModelSteps from './GetModels.steps';
// use chaiAsPromised to handle async calls
chai.use(chaiAsPromised);
const { expect } = chai;

describe('When getting models by list of Ids', () => {
  let ctx: AdtMockTestContext;
  let steps: GetModelSteps;

  beforeEach(() => {
    ctx = new AdtMockTestContext();
    steps = new GetModelSteps(ctx);
  });

  it('Given valid Ids of existing models provided', async () => {
    // Arrange
    const models = steps.arrangeModelsExist();
    const modelIds = ['1', '2', '3'];

    // Act
    const result = await ctx.modelService.getModelsByIds(modelIds);

    // Assert
    expect(ctx.digitalTwinsClient.listModels.calledOnceWith(modelIds),
      'should call adt listModels with the provided modelIds').to.be.true;
    expect(result, 'should return models returned by ADT')
      .to.deep.equal(models);
  });

  it('Given ADT listModels rejects', async () => {
    // Arrange
    steps.arrangeListModelsRejects();

    // Act/Assert
    await expect(ctx.modelService.getModelsByIds([]),
      'should reject if listModels rejects').to.be.rejected;
  });
});

describe('When getting models by version', () => {
  let ctx: AdtMockTestContext;
  let steps: GetModelSteps;

  beforeEach(() => {
    ctx = new AdtMockTestContext();
    steps = new GetModelSteps(ctx);
  });

  it('Given models exist with provided version', async () => {
    // Arrange
    const version = 'testVersion';
    const modelsWithVersion = steps.arrangeModelsExistWithVersion(version);

    // Act
    const result = await ctx.modelService.getModelsByVersion(version);

    // Assert
    expect(result, 'should return only models with the provided version')
      .to.deep.equal(modelsWithVersion);
  });

  it('Given ADT listModels rejects', async () => {
    // Arrange
    steps.arrangeListModelsRejects();

    // Act/Assert
    await expect(ctx.modelService.getModelsByVersion('unused'),
      'should reject if listModels rejects').to.be.rejected;
  });
});

describe('When getting all models', () => {
  let ctx: AdtMockTestContext;
  let steps: GetModelSteps;

  beforeEach(() => {
    ctx = new AdtMockTestContext();
    steps = new GetModelSteps(ctx);
  });

  it('Given models exist', async () => {
    // Arrange
    const models = steps.arrangeModelsExist();

    // Act
    const result = await ctx.modelService.getAllModels();

    // Assert
    expect(ctx.digitalTwinsClient.listModels.calledOnceWith(undefined, true),
      'should call adt listModels with the provided modelIds').to.be.true;
    expect(result, 'should return all models returned by ADT')
      .to.deep.equal(models);
  });

  it('Given ADT listModels rejects', async () => {
    // Arrange
    steps.arrangeListModelsRejects();

    // Act/Assert
    await expect(ctx.modelService.getAllModels(),
      'should reject if listModels rejects').to.be.rejected;
  });
});
