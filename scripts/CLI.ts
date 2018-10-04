import * as program from "commander";
import {APILove, APILoveOptions} from "../APILove";

let pkgJSON = require("../package.json");

program
    .version(pkgJSON.version)
    .command("build <apiHandler.js>", "Build the necessary files for deployment using serverless.")
    .action((cmd, file) => {

        // @ts-ignore
        APILove._buildOnly = true;
        let apiHandler = require(file);

        // @ts-ignore
        let options:APILoveOptions = APILove._buildOptions;

        return;
        //console.log('remove ' + dir + (cmd.recursive ? ' recursively' : ''))
    });

program.parse(process.argv);