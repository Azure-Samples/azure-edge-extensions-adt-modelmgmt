import * as path from 'path';
import { Options } from 'yargs';
import ModelService from '../index';
import handleError from '../extensions/handleError';

export const command = 'upload';
export const description = 'Uploads a batch of ADT models in JSON format to a given Instance';
export const builder: { [key: string]: Options } = {
  'adt-host-name': {
    alias: 'n',
    describe: 'The ADT instance URL to upload the models to',
    type: 'string',
    nargs: 1,
    demand: true,
    requiresArg: true,
  },
  'model-path': {
    alias: 'p',
    describe: 'The path to the directory containing the ADT Models',
    type: 'string',
    nargs: 1,
    demand: true,
    requiresArg: true,
  },
  'clobber': {
    alias: 'c',
    describe: 'Set to overwrite the latest model version',
    type: 'boolean',
  }
};

export const handler = handleError(async (argv: unknown): Promise<void> => {
  const modelService = new ModelService(argv['adt-host-name']);
  const modelDirPath = path.resolve(argv['model-path']);
  const clobber = argv['clobber'];
  await modelService.uploadModelDir(
    modelDirPath,
    clobber
  );
});
