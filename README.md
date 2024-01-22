# Model Management CLI

This project is aimed to provide a CLI for managing the lifecycle of DTDL models within Azure Digital Twins.

## Features

This project framework provides the following features:

* Feature 1
* Feature 2
* ...

## Getting Started

### Prerequisites

1. Download and install [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
   1. Node min version 14.16.1
   2. NPM min version 7.8.0


### Quickstart
(Add steps to get up and running quickly)

1. git clone git@github.com:Azure-Samples/azure-edge-extensions-adt-modelmgmt.git
2. cd azure-edge-extensions-adt-modelmgmt
3. Install and build the utility
```shell
npm install
npm run build
npm link
```
4. Then, all interactions with the model management cli are of the form -

```shell
model-cli [command] [options]
```
## Usage
For example, when using the `upload` command with arguments, it might look something like -

```shell
model-cli upload -n "https://my-instance.digitaltwins.azure.net" -p ./Sample-Models
```

This works because `npm link` creates a symlink of the model directory and makes it available in your global package repository.
So now, you can use the package from the command line, and your changes will also be reflected after you transpile your code without having to `npm install` over and over again.

Or, as shown in [this section](#debug), you can use the `npm start --` syntax to use the CLI without having to use `npm link`.

### Help Usage

To display all supported commands -

```shell
model-cli --help
```

To display arguments pertaining to a particular command -

```shell
model-cli [command] --help
```

### Available Commands

```shell
model-cli <command>

Commands:
  model-cli decommission  (Decommission models from an ADT instance by
                                 model version number
  model-cli delete        Deletes models from an ADT instance
  model-cli upload        Uploads a batch of ADT models in JSON format to
                                 a given Instance

Options:
      --version  Show version number                                   [boolean]
  -h, --help     Show help                                             [boolean]
```

[upload](https://docs.microsoft.com/en-us/javascript/api/@azure/digital-twins-core/digitaltwinsclient?view=azure-node-latest#createModels_any____OperationOptions_) options -

```shell
Options:
      --version        Show version number                             [boolean]
  -n, --adt-host-name  The ADT instance URL to upload the models to
                                                             [string] [required]
  -p, --model-path     The path to the directory containing the ADT Models
                                                             [string] [required]
  -h, --help           Show help                                       [boolean]
```

[decommission](https://docs.microsoft.com/en-us/javascript/api/@azure/digital-twins-core/digitaltwinsclient?view=azure-node-latest#decomissionModel_string__OperationOptions_) options -

```shell
Options:
      --version        Show version number                             [boolean]
  -n, --adt-host-name  The ADT instance URL to decommission models from
                                                             [string] [required]
  -V, --model-version  The version number to decommission    [string] [required]
  -d, --dry-run        Dry run for models to be decommissioned
  -h, --help           Show help                                       [boolean]
```

[delete](https://docs.microsoft.com/en-us/javascript/api/@azure/digital-twins-core/digitaltwinsclient?view=azure-node-latest#createModels_any____OperationOptions_) options -

```shell
Options:
      --version        Show version number                             [boolean]
  -n, --adt-host-name  The ADT instance URL to delete models from
                                                             [string] [required]
  -m, --model-ids      An array of model ids for deletion                [array]
  -a, --all-models     Delete all models in the ADT instance           [boolean]
  -V, --model-version  The version of models to delete                  [string]
  -d, --dry-run        Dry run for models to be deleted                [boolean]
  -h, --help           Show help                                       [boolean]
```

## Exit Codes

| Exit Code | Description    |
| --------- | -------------- |
| 0         | Success        |
| Non-zero  | Failure        |

## Environment Variable Configuration

| Environment Variable   | Description                            |
| --------------------   | -------------------------------------- |
| AZURE_DIGITALTWINS_URL | URL of your ADT instance               |

## Contributing

> **NOTE:** All terminal commands assume that `./model/` is the current working directory, unless stated otherwise.

### Install

To install package dependencies for the project, the following command can be used:

```shell
npm clean-install
```

### Build

To build the project, the following command can be used:

```shell
npm run build
```

### Lint

To lint the project, the following command can be used:

```shell
npm run lint
```

#### Fixing Lint Errors

If there are any lint errors, the build will fail and report the errors it has in the console. In order to fix lint errors automatically the following command can be used:

```shell
npm run lint-fix
```

### Debug

Launch the [Javascript Debug Terminal](https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_javascript-debug-terminal).
Change into the model directory:

```shell
cd ./model
```

Run `npm start --` followed by the model cli command to debug. For example, to debug upload:

```shell
npm start -- upload -n https://my-adt-instance-url -p ./my-models
```

### Test

#### Unit tests

To run the unit tests for the project, the following command can be used:

```shell
npm run test
```