#!/usr/bin/env node
import yargs from 'yargs';
import * as upload from './commands/upload';
import * as del from './commands/delete';
import * as decommission from './commands/decommission';

// There is currently a bug in yargs when unit testing a CLI using the commandsDir option https://github.com/yargs/yargs/issues/2038
yargs(process.argv.slice(2))
  .command(upload)
  .command(del)
  .command(decommission)
  .demandCommand()
  .alias('h', 'help')
  .help('help')
  .showHelpOnFail(false, 'Specify --help for available options')
  .parseAsync()
  .catch((error) => {
    console.error('error occurred!', error);
  });
