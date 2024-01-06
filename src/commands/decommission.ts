import { Options } from 'yargs';
import ModelService from '../index';
import handleError from '../extensions/handleError';

export const command = 'decommission';
export const description = 'Decommission models from an ADT instance by model version number';
export const builder: { [key: string]: Options } = {
  'adt-host-name': {
    alias: 'n',
    describe: 'The ADT instance URL to decommission models from',
    type: 'string',
    nargs: 1,
    demand: true,
    requiresArg: true,
  },
  'model-version': {
    alias: 'V',
    describe: 'The version number to decommission',
    type: 'string',
    nargs: 1,
    demand: true,
    requiresArg: true,
  },
  'dry-run': {
    alias: 'd',
    describe: 'Dry run for models to be decommissioned',
    type: 'boolean',
    nargs: 0,
    demand: false,
    requiresArg: false,
  },
};
export const handler = handleError(async (argv: unknown): Promise<void> => {
  const modelService = new ModelService(argv['adt-host-name']);
  const isDryRun = (argv['dry-run'] !== undefined);
  await modelService.decommissionModelsByVersion(argv['model-version'], isDryRun);
});
