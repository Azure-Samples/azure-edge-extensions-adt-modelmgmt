import { expect } from 'chai';
import { Model } from '../src/models';
import ModelServiceSteps from './ModelServiceSteps';

export default class DeleteModelSteps extends ModelServiceSteps {
  arrangeModelsExistWithDependencies(): Model[] {
    const models = this.generateDependentModels();
    const modelIds = models.map((model) => model['@id']);
    const modelMeta = models.map((model) => ({ model }));
    this.ctx.digitalTwinsClient.listModels.withArgs(modelIds).resolves(modelMeta);
    return models;
  }

  arrangeModelsExistWithDependenciesGetAll(): Model[] {
    const models = this.generateDependentModels();
    const modelMeta = models.map((model) => ({ model }));
    this.ctx.digitalTwinsClient.listModels.withArgs(undefined, true).resolves(modelMeta);
    return models;
  }

  async actDeleteModelBatch(models: Model[], dryrun = false): Promise<void> {
    const modelIds = models.map((model) => model['@id']);
    await this.ctx.modelService.deleteModelBatchByIds(modelIds, dryrun);
  }

  assertModelsDeletedInOrder(modelsToDelete: Model[]): void {
    const actualDeletedIdsOrder = this.ctx.digitalTwinsClient.deleteModel.args.flat();
    expect(actualDeletedIdsOrder.length, 'should call delete with every expected id')
      .to.equal(modelsToDelete.length);
    const actualModelOrder = actualDeletedIdsOrder
      .map((id) => modelsToDelete.find((model) => model['@id'] === id));

    const uploadedIdList = [];
    actualModelOrder.forEach((model) => {
      if (model.extends) {
        expect(!uploadedIdList.includes(model.extends),
          `model: ${model['@id']}, which extends should be deleted before its parent`)
          .to.be.true;
      }
      uploadedIdList.push(model['@id']);
    });
  }
}
