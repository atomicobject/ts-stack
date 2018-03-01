import {
  PackageJson,
  PackageName,
  PackageRange,
  PackageVersion,
  DirPath,
  CommandString,
  CommandWithArgs
} from "../types";
import { crossSpawn, spawnWithEnv, shellEscape } from "../spawn";
import { Isomorphism } from "@atomic-object/lenses";

import * as Dependencies from "../types/dependencies";
import { isString } from "lodash";

/** return the flag for `yarn add` given a DepLevel */
function yarnAddFlag(level: Dependencies.DepLevel): string | null {
  switch (level) {
    case "dependencies":
      return null;
    case "devDependencies":
      return "-D";
    case "optionalDependencies":
      return "-O";
  }
}

/** Format a DepPair as a 'packageName'@'version' to pass to yarn */
function yarnPackageVersionArg([name, range]: Dependencies.DepPair): string {
  return `${name}@${range}`;
}

/** Return the set of commands to run to upgrade the given set of dependencies */
export function upgradePlan(
  deps: Dependencies.Dependencies
): CommandWithArgs[] {
  const result: CommandWithArgs[] = [];

  for (const key of Dependencies.DEP_LEVELS) {
    const levelDeps = deps[key];
    if (!levelDeps) continue;

    const depArgs = Dependencies.depMapPairsIso
      .to(levelDeps)
      .map(yarnPackageVersionArg);

    const flag = yarnAddFlag(key);
    const yarnArgs = ["add", flag, ...depArgs].filter(isString);
    result.push(["yarnpkg", yarnArgs]);
  }

  return result;
}
