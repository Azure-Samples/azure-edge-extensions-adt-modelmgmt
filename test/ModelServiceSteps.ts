import { stub } from 'sinon';
import { Model } from '../src/models';
import AdtMockTestContext from './AdtMockTestContext';

export default class ModelServiceSteps {
  ctx: AdtMockTestContext;

  constructor(ctx: AdtMockTestContext) {
    this.ctx = ctx;
  }

  arrangeDeleteModelRejects(id: string): void {
    this.ctx.digitalTwinsClient.deleteModel.withArgs(id).rejects();
  }

  arrangeListModelsRejects(): void {
    this.ctx.digitalTwinsClient.listModels.rejects();
  }

  arrangeModelsWithVersionExist(): Model[] {
    const models = this.generateDependentModels();
    stub(this.ctx.modelService, 'getModelsByVersion').callsFake(() => Promise.resolve(models));
    return models;
  }

  generateDependentModels(): Model[] {
    return [
      { id: 'b', extends: 'a' },
      { id: 'b2', extends: 'a' },
      { id: 'a' },
      { id: 'c', extends: 'b' },
    ].map((modelTemplate) => ({
      '@id': modelTemplate.id,
      '@type': 'Interface',
      '@context': '',
      extends: modelTemplate.extends,
    }));
  }

  generateModels(numModels: number): Model[] {
    const models = [];
    for (let i = 0; i < numModels; i += 1) {
      models.push(
        {
          '@id': Math.random().toString(),
          '@type': 'Interface',
          '@context': '',
        },
      );
    }

    return models;
  }

  generateModelsWithVersion(version: string, numModels = 3): Model[] {
    const models = [];
    for (let i = 0; i < numModels; i += 1) {
      models.push(
        {
          '@id': `${Math.random().toString()};${version}`,
          '@type': 'Interface',
          '@context': '',
        },
      );
    }

    return models;
  }
}
