import { exec, ChildProcess } from "mz/child_process";
let _yarnPath: string | undefined;

import * as readPkg from "read-pkg-up";
import { FilePath, PackageJson, DirPath } from "./types";
import * as path from "path";

export async function yarnPath(): Promise<string> {
  if (!_yarnPath) {
    const [stdout, stderr] = await exec("yarn -s --json env");
    const stringOutput = stdout.toString("utf8");
    try {
      const vars = JSON.parse(JSON.parse(stringOutput).data);
      _yarnPath = vars.PATH;
    } catch (e) {
      console.log({ badEnv: stringOutput });
      throw e;
    }
  }
  return _yarnPath!;
}

let pkg: { path: string; pkg: PackageJson };
export async function readPackageJson(): Promise<readPkg.Package> {
  pkg = pkg || (await readPkg());

  return pkg.pkg;
}

export async function findPackageJson(): Promise<FilePath> {
  pkg = pkg || (await readPkg());
  return path.resolve(pkg.path);
}

export async function projectRoot(): Promise<DirPath> {
  return path.dirname(await findPackageJson());
}
