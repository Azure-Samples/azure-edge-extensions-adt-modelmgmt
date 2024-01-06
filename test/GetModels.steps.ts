import { Model } from '../src/models';
import ModelServiceSteps from './ModelServiceSteps';

export default class DeleteModelSteps extends ModelServiceSteps {
  arrangeModelsExistWithVersion(version: string): Model[] {
    const modelsWithoutVersion = this.generateModels(3);
    const modelsWithVersion = this.generateModelsWithVersion(version);
    const models = modelsWithoutVersion.concat(modelsWithVersion);

    const modelMeta = models.map((model) => ({ model }));
    this.ctx.digitalTwinsClient.listModels.withArgs(undefined, true).resolves(modelMeta);
    return modelsWithVersion;
  }

  arrangeModelsExist(): Model[] {
    const models = this.generateModels(3);
    const modelMeta = models.map((model) => ({ model }));
    this.ctx.digitalTwinsClient.listModels.resolves(modelMeta);
    return models;
  }
}
