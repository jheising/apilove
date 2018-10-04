This project provides a library and API for using signalpattern in popular chat/messaging services.

### Deploying the API

1. Rename `.secrets_example.json` to `.secrets.prod.json` or `.secrets.dev.json` depending on your deployment.
1. Modify the secrets in `.secrets.*.json` to the proper values for your deployment.
1. Make sure the package **Serverless** is installed globally (`npm install -g serverless`).
1. Make sure you have an AWSCLI login profile with the proper permissions named `buglabs`. Note: you can specify another profile name with the `--profile some_name` switch on the `sls deploy` function in the next step.
1. Run `sls deploy --stage dev` or Run `sls deploy --stage prod`.

### Configuration and Environment Variables
See [Config.ts](../lib/Services/Config.ts) for details.