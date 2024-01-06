import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe, it, beforeEach } from 'mocha';
import AdtMockTestContext from './AdtMockTestContext';
import UploadModelDirSteps from './UploadModelDir.steps';

// use chaiAsPromised to handle async calls
chai.use(chaiAsPromised);
const { expect } = chai;

describe('When uploading ADT Models from a directory', () => {
  let ctx: AdtMockTestContext;
  let steps: UploadModelDirSteps;

  beforeEach(() => {
    ctx = new AdtMockTestContext();
    steps = new UploadModelDirSteps(ctx);
  });

  it('Given an invalid path was given', async () => {
    // Arrange
    const badPath = '..//@batpath';

    // Act/Assert
    await expect(ctx.modelService.uploadModelDir(badPath, 10, 0),
      'should throw Error if provided path is invalid').to.be.rejectedWith('Invalid Model Directory');
  });

  it('Given the provided directory has no files', async () => {
    // Arrange
    steps.arrangeEmptyModelDir();

    // Act/Assert
    await expect(ctx.modelService.uploadModelDir('.'), 'should throw if modelDir has no files')
      .to.be.rejectedWith('Error: modelDirectoryPath is empty');
  });

  it('Given the provided directory contains valid models with dependencies', async () => {
    // Arrange
    steps.arrangeLoadModelsWithDependencies();

    // Act
    await ctx.modelService.uploadModelDir('.', 10, 0);

    // Assert
    steps.assertModelsUploadedInOrder();
  });

  it('Given a batchSize was set', async () => {
    // Arrange
    const batchSize = 2;
    const numModels = 5;
    const batchDelay = 0;
    steps.arrangeLoadModels(numModels);

    // Act
    await ctx.modelService.uploadModelDir('.', batchSize, batchDelay);

    // Assert
    steps.assertBatchSizeUsed(batchSize, numModels);
  });

  it('Given a batchDelay was set', async () => {
    // Arrange
    const batchSize = 2;
    const numModels = 6;
    const batchDelayMs = 500;
    steps.arrangeLoadModels(numModels);

    // Act
    const startTime = Date.now();
    await ctx.modelService.uploadModelDir('.', batchSize, batchDelayMs);
    const endTime = Date.now();

    // Assert
    steps.assertBatchDelayUsed(batchSize, numModels, batchDelayMs, startTime, endTime);
  });

  it('Given a service failure with ADT', async () => {
    // Arrange
    steps.arrangeLoadModels(5);
    steps.arrangeAdtFailure();

    // Act/Assert
    await expect(ctx.modelService.uploadModelDir('.', 10, 0)).to.be.rejected;
  });
});
