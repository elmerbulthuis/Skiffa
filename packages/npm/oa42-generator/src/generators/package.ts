import * as oa42Core from "@oa42/core";
import fs from "fs";
import { Router } from "goodrouter";
import * as jns42generator from "jns42-generator";
import path from "path";
import { NestedText, flattenNestedText, itt, splitIterableText } from "../utils/index.js";
import { generateBrowserTsCode } from "./files/browser-ts.js";
import { generateBuildJsCode } from "./files/build-js.js";
import { generateCleanJsCode } from "./files/clean-js.js";
import { generateClientServerTestTsCode } from "./files/client-server-test-ts.js";
import { generateClientTsCode } from "./files/client-ts.js";
import { generateMainTsCode } from "./files/main-ts.js";
import { generatePackageJsonData } from "./files/package-json.js";
import { generateParametersTsCode } from "./files/parameters-ts.js";
import { generateRollupConfigJsCode } from "./files/rollup-config-js.js";
import { generateServerTsCode } from "./files/server-ts.js";
import { generateSharedTsCode } from "./files/shared-ts.js";
import { generateTsconfigJsonData } from "./files/tsconfig-json.js";

export interface PackageConfiguration {
  packageName: string;
  packageVersion: string;
  packageDirectoryPath: string;
  requestTypes: string[];
  responseTypes: string[];
}

export function generatePackage(
  apiModel: oa42Core.ApiContainer,
  specification: jns42generator.Specification,
  packageConfiguration: PackageConfiguration,
) {
  const names = {} as Record<string, string>;
  const mockables = new Set<string>();
  for (let key = 0; key < specification.typesArena.count(); key++) {
    const item = specification.typesArena.getItem(key);
    const { location } = item;
    if (location == null) {
      continue;
    }
    const name = specification.names.getName(key);
    if (name == null) {
      continue;
    }
    names[location] = name.toPascalCase();
    if (jns42generator.isMockable(specification.typesArena, key)) {
      mockables.add(location);
    }
  }

  const router = new Router<number>();
  const paths = apiModel.paths;
  for (const pathModel of paths) {
    router.insertRoute(pathModel.id, pathModel.pattern);
  }

  const { packageDirectoryPath, packageName, packageVersion } = packageConfiguration;

  fs.mkdirSync(packageDirectoryPath, { recursive: true });
  fs.mkdirSync(path.join(packageDirectoryPath, "src"), { recursive: true });
  fs.mkdirSync(path.join(packageDirectoryPath, "scripts"), { recursive: true });

  {
    const data = generatePackageJsonData(packageName, packageVersion);
    const filePath = path.join(packageDirectoryPath, "package.json");
    fs.writeFileSync(filePath, JSON.stringify(data, undefined, 2));
  }

  {
    const data = generateTsconfigJsonData();
    const filePath = path.join(packageDirectoryPath, "tsconfig.json");
    fs.writeFileSync(filePath, JSON.stringify(data, undefined, 2));
  }

  {
    const content = generateRollupConfigJsCode();
    const filePath = path.join(packageDirectoryPath, "rollup.config.js");
    writeContentToFile(filePath, content);
  }

  {
    const content = generateMainTsCode();
    const filePath = path.join(packageDirectoryPath, "src", "main.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = generateBrowserTsCode();
    const filePath = path.join(packageDirectoryPath, "src", "browser.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = generateSharedTsCode(apiModel);
    const filePath = path.join(packageDirectoryPath, "src", "shared.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = generateParametersTsCode(names, apiModel);
    const filePath = path.join(packageDirectoryPath, "src", "parameters.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = generateClientTsCode(names, router, apiModel);
    const filePath = path.join(packageDirectoryPath, "src", "client.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = generateServerTsCode(names, router, apiModel);
    const filePath = path.join(packageDirectoryPath, "src", "server.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = generateClientServerTestTsCode(names, mockables, apiModel);
    const filePath = path.join(packageDirectoryPath, "src", "client-server.test.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = jns42generator.generateTypesTsCode(specification);
    const filePath = path.join(packageDirectoryPath, "src", "types.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = jns42generator.generateValidatorsTsCode(specification);
    const filePath = path.join(packageDirectoryPath, "src", "validators.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = jns42generator.generateParsersTsCode(specification);
    const filePath = path.join(packageDirectoryPath, "src", "parsers.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = jns42generator.generateMocksTsCode(specification);
    const filePath = path.join(packageDirectoryPath, "src", "mocks.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = jns42generator.generateExamplesTestTsCode(specification);
    const filePath = path.join(packageDirectoryPath, "src", "examples.test.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = jns42generator.generateMocksTestTsCode(specification);
    const filePath = path.join(packageDirectoryPath, "src", "mocks.test.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = generateBuildJsCode();
    const filePath = path.join(packageDirectoryPath, "scripts", "build.js");
    writeContentToFile(filePath, content);
    fs.chmodSync(filePath, 0o755);
  }

  {
    const content = generateCleanJsCode();
    const filePath = path.join(packageDirectoryPath, "scripts", "clean.js");
    writeContentToFile(filePath, content);
    fs.chmodSync(filePath, 0o755);
  }

  {
    const content = itt`
      .*
      !.gitignore
      *.tsbuildinfo
      transpiled/
      typed/
      bundled/
    `;
    const filePath = path.join(packageDirectoryPath, ".gitignore");
    writeContentToFile(filePath, content);
  }
}

function writeContentToFile(filePath: string, code: NestedText) {
  const fd = fs.openSync(filePath, "w");

  try {
    for (let text of splitIterableText(flattenNestedText(code))) {
      text = text.trim();
      if (text.length === 0) {
        continue;
      }
      text += "\n";
      fs.writeFileSync(fd, text);
    }
  } finally {
    fs.closeSync(fd);
  }
}
