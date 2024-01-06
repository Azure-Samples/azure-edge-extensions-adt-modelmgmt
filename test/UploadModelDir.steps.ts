import { expect } from 'chai';
import { stub } from 'sinon';
import ModelServiceSteps from './ModelServiceSteps';

export default class UploadModelDirSteps extends ModelServiceSteps {
  arrangeLoadModelsWithDependencies(): void {
    stub(this.ctx.modelService, 'loadModels').callsFake(() => Promise.resolve(this.generateDependentModels()));
  }

  arrangeLoadModels(numModels: number): void {
    stub(this.ctx.modelService, 'loadModels').callsFake(() => Promise.resolve(this.generateModels(numModels)));
  }

  arrangeAdtFailure(): void {
    this.ctx.digitalTwinsClient.createModels.throws('RequestFailedException');
  }

  arrangeEmptyModelDir(): void {
    stub(this.ctx.modelService, 'loadFileNames').callsFake(() => Promise.resolve([]));
  }

  assertModelsUploadedInOrder(): void {
    const actualChunk = this.ctx.digitalTwinsClient.createModels.args[0][0];

    const uploadedIdList = [];
    actualChunk.forEach((model) => {
      if (model.extends) {
        expect(uploadedIdList.includes(model.extends),
          'a model that is extended should be uploaded before models that extend it').to.be.true;
      }
      uploadedIdList.push(model['@id']);
    });
  }

  assertBatchDelayUsed(
    batchSize: number,
    numModels: number,
    batchDelayMs: number,
    startTime: number,
    endTime: number,
  ): void {
    const expectedUploadCalls = Math.ceil(numModels / batchSize);
    const expectedMinDuration = (expectedUploadCalls - 1) * batchDelayMs;
    const duration = endTime - startTime;
    expect(duration, 'uploadModelDir should take at least batchDelayMs**numBatches-1) ms.')
      .to.be.greaterThan(expectedMinDuration);
  }

  assertBatchSizeUsed(
    batchSize: number,
    numModels: number,
  ): void {
    const expectedUploadCalls = Math.ceil(numModels / batchSize);
    expect(this.ctx.digitalTwinsClient.createModels.callCount,
      'number of batches did not match expected based on batchSize and number of models.')
      .to.equal(expectedUploadCalls);
  }
}
