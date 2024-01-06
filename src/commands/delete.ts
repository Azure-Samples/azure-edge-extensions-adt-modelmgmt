import { Options } from 'yargs';
import ModelService from '../index';
import handleError from '../extensions/handleError';

export const command = 'delete';
export const description = 'Deletes models from an ADT instance';
export const builder: { [key: string]: Options } = {
  'adt-host-name': {
    alias: 'n',
    describe: 'The ADT instance URL to delete models from',
    string: true,
    nargs: 1,
    demand: true,
    requiresArg: true,
  },
  'model-ids': {
    alias: 'm',
    describe: 'An array of model ids for deletion',
    type: 'array',
    nargs: 1,
    demand: false,
    requiresArg: false,
  },
  'all-models': {
    alias: 'a',
    describe: 'Delete all models in the ADT instance',
    type: 'boolean',
    nargs: 0,
    demand: false,
    requiresArg: false,
  },
  'model-version': {
    alias: 'V',
    describe: 'The version of models to delete',
    type: 'string',
    nargs: 1,
    demand: false,
    requiresArg: true,
  },
  'dry-run': {
    alias: 'd',
    describe: 'Dry run for models to be deleted',
    type: 'boolean',
    nargs: 0,
    demand: false,
    requiresArg: false,
  },
};

export const handler = handleError(async (argv: unknown): Promise<void> => {
  const modelService = new ModelService(argv['adt-host-name']);
  const isDryRun = argv['dry-run'] !== undefined;
  const isAllModels = argv['all-models'] !== undefined;
  const modelVersion = argv['model-version'];
  if (isAllModels) {
    await modelService.deleteAllModels(isDryRun);
  } else if (modelVersion !== undefined) {
    await modelService.deleteModelsByVersion(modelVersion, isDryRun);
  } else {
    await modelService.deleteModelBatchByIds(argv['model-ids'], isDryRun);
  }
});
