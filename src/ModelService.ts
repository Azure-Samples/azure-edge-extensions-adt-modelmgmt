import { DigitalTwinModelsAddResponse, DigitalTwinsClient } from '@azure/digital-twins-core';
import * as fs from 'fs';
import glob from 'glob-promise';
import { toArray } from 'ix/asynciterable';
import { DefaultAzureCredential } from '@azure/identity';
import { Model, Component } from './models';
import './extensions/serialForEach';
import './extensions/topoSort';
import './extensions/chunk';
import './extensions/hash';
import { wait } from './utilities';

export default class ModelService {
  public adtService: DigitalTwinsClient;

  readonly BATCH_SIZE = 50;

  readonly BATCH_DELAY = 1000;

  constructor(
    adt: string | DigitalTwinsClient,
  ) {
    if (adt instanceof DigitalTwinsClient) {
      this.adtService = adt;
    } else if (!adt || adt.length === 0) {
      throw new Error(
        'Required environment variable AZURE_DIGITALTWINS_URL is not set.',
      );
    } else {
      this.adtService = new DigitalTwinsClient(
        adt.match(/http.*/) ? adt : `https://${adt}`,
        new DefaultAzureCredential(),
      );
    }
  }

  public async deleteAllModels(isDryRun?: boolean): Promise<void> {
    const models = await this.getAllModels();
    if (isDryRun) {
      console.info(models.length > 0 ? `Models to be deleted: ${models.length}` : 'No models to be deleted.');
    } else {
      await this.purgeModels(models);
    }
  }

  public async deleteModelById(modelId: string): Promise<unknown> {
    return this.adtService.deleteModel(modelId);
  }

  public async deleteModelBatchByIds(modelIds: string[], isDryRun?: boolean): Promise<void> {
    try {
      const models = await this.getModelsByIds(modelIds);
      if (isDryRun) {
        console.info(models.length > 0 ? `Models to be deleted: ${models.length}` : 'No models to deleted');
      } else {
        await this.purgeModels(models);
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  public async deleteModelsByVersion(version: string, isDryRun?: boolean): Promise<void> {
    const models = await this.getModelsByVersion(version);
    if (isDryRun) {
      console.info(models.length > 0 ? `Models to be deleted: ${models.length}` : 'No models to deleted');
    } else {
      await this.purgeModels(models);
    }
  }

  public async decommissionModelById(modelId: string): Promise<unknown> {
    return this.adtService.decomissionModel(modelId);
  }

  public async decommissionModelsByVersion(version: string, isDryRun?: boolean): Promise<void> {
    const models = await this.getModelsByVersion(version);
    if (isDryRun) {
      console.info(models.length > 0 ? `Models to be decommissioned: ${models.length}` : 'No models to be decommissioned');
    } else {
      await models.topoSort().serialForEach(async (item) => this.adtService.decomissionModel(item['@id']));
    }
  }

  public async uploadModelDir({
    modelDirectoryPath = '',
    batchSize = this.BATCH_SIZE,
    batchDelay = this.BATCH_DELAY,
    clobber = false
  } = {}
  ): Promise<DigitalTwinModelsAddResponse> {
    if (!fs.existsSync(modelDirectoryPath)) {
      console.log('Error: modelDirectoryPath must be a directory');
      throw new Error('Invalid Model Directory');
    }
    if(clobber){
      await this.deleteAllModels();
    }
    const localModels = await this.loadModels(modelDirectoryPath);
    const remoteModels = await this.getAllModels();
    const sameModels = await this.areModelsEquivalent(localModels, remoteModels);
    const currentRemoteVersion = getCurrentVersion(remoteModels);
    if(sameModels) {
      console.info("No changes detected between local and remote ontologies");
      return null;
    }
    await this.incrementVersion(localModels, currentRemoteVersion);

    const batching = localModels.length > batchSize;
    const batchSizeInfo = batching ? ` in batches of ${batchSize}` : '';
    const batchDelayInfo = batching && batchDelay > 0 ? ` with ${batchDelay / 1000} seconds delay between batches` : '';
    console.info(`Uploading ${localModels.length} models${batchSizeInfo}${batchDelayInfo}...`);

    const result = await localModels
      .topoSort()
      .reverse()
      .chunk(batchSize)
      .serialForEach(async (chunk, i) => {
        if (i > 0 && batchDelay > 0) {
          // ADT may require throttling to avoid eventual consistency issues
          console.info(`Throttle delay (${batchDelay / 1000}s)...`);
          await wait(batchDelay);
        }
        if (batching) console.info(`Uploading ${chunk.length} models...`);
        const response = await this.adtService.createModels(chunk);
        console.info(`Successfully created ${response?.length} models`);

        return response;
      }) as DigitalTwinModelsAddResponse;

    console.log('===============================');
    console.log(`Successfully uploaded ${(result).length} models`);

    return result;
  }

  async incrementVersion(models: Model[], currentRemoteVersion: number): Promise<void> {
    currentRemoteVersion++;
    // need to also update versions of all references.
    for (let i = 0; i < models.length; i++) {
      const element = models[i];
      var modelId = element['@id'];
      modelId = modelId.split(';')[0].concat(';'+currentRemoteVersion.toString());
      models[i]['@id'] = modelId;

      if (element.contents) {
        element.contents
          .filter((e) => e['@type'] === 'Component')
          .forEach((component: Component) => {
            const componentId = component.schema.split(';')[0].concat(';' + currentRemoteVersion.toString());
            component.schema = componentId;
          });
        element.contents
        .filter((e) => e['@type'] === 'Relationship')
        .forEach((relationship:any) => {
          const componentId = relationship.target.split(';')[0].concat(';' + currentRemoteVersion.toString());
          relationship.target = componentId;
        });
      }
      if(element.extends) {
        if (typeof element.extends === 'string') {
          const extendsId = element.extends.split(';')[0].concat(';' + currentRemoteVersion.toString());
          element.extends = extendsId;
        } else {
          for (let j = 0; j < element.extends.length; j++) {
            const extend = element.extends[j];
            const extendsId = extend.split(';')[0].concat(';' + currentRemoteVersion.toString());
            element.extends[j] = extendsId;
          }
        }
      }
      
    }
  }

  async areModelsEquivalent(localModels: Model[], remoteModels: Model[]): Promise<boolean> {
    var noChangeDetected = true;
    //are the local and remote ontologies the same length?
    if (remoteModels.length != localModels.length) {
      return false
    }
    if(remoteModels.length>0){
      console.info('Detected existing ontology, comparing with local');
      const remoteModelDictionary = {};
      remoteModels.forEach(element => {
       remoteModelDictionary[element['@id']] = JSON.stringify(element).hashCode();
      });
      const localModelDictionary = {};
      localModels.forEach(element => {
        localModelDictionary[element['@id']] = JSON.stringify(element).hashCode();
      })
      remoteModels.forEach(element => {
        const modelId = element['@id'];
        if(remoteModelDictionary[modelId]!=localModelDictionary[modelId]) {
          noChangeDetected = false;
        }
      });
    }
    return noChangeDetected;
  }

  async purgeModels(models: Model[]): Promise<void> {
    await models.topoSort().serialForEach(async (item) => this.adtService.deleteModel(item['@id']));
  }

  async getAllModels(): Promise<Model[]> {
    const response = await this.adtService.listModels(undefined, true);
    const modelMeta = await toArray(response);
    return modelMeta.filter((item) => item.model != null && item.model['@type'] === 'Interface')
      .map((m) => m.model as Model);
  }

  async getModelsByIds(modelIds: string[]): Promise<Model[]> {
    const response = await this.adtService.listModels(modelIds);
    const modelMeta = await toArray(response);
    return modelMeta.filter((item) => item.model != null && item.model['@type'] === 'Interface')
      .map((m) => m.model as Model);
  }

  async getModelsByVersion(version: string): Promise<Model[]> {
    const response = await this.adtService.listModels(undefined, true);
    const modelMeta = await toArray(response);
    return modelMeta.filter((item) => item.model != null
      && item.model['@type'] === 'Interface'
      && item.model['@id'].split(';')[1] === version)
      .map((m) => m.model as Model);
  }

  public async loadModels(modelDirectoryPath: string): Promise<Model[]> {
    const fileNames = await this.loadFileNames(modelDirectoryPath);
    if (fileNames.length === 0) {
      throw new Error('Error: modelDirectoryPath is empty');
    }
    return Promise.all(fileNames.map(async (fn) => JSON.parse(await fs.promises.readFile(fn, 'utf8')) as Model));
  }

  public async loadFileNames(directoryPath: string): Promise<string[]> {
    return glob(`${directoryPath}/**/*.json`);
  }
}
function getCurrentVersion(remoteModels: Model[]): number {
  //get the max version number derived from the model id string after the ;
  var currentVersion = 0;
  remoteModels.forEach(element => {
    var modelId = element['@id'];
    var version = Number.parseInt(modelId.split(';')[1]);
    if (version > currentVersion) {
      currentVersion = version;
    }
  });
  return currentVersion;
}

