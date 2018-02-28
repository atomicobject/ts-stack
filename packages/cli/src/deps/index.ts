import {
  Dependencies,
  PackageJson,
  DepLevel,
  PackageName,
  PackageRange,
  DEP_LEVELS,
  PackageVersion,
  DepMap,
  DirPath,
  DepPair,
  CommandString,
  CommandWithArgs
} from "../types";
import { mapValues, pickBy, some, isEmpty, map } from "lodash";
import * as semver from "semver";
import { crossSpawn, spawnWithEnv, shellEscape } from "../spawn";

function depLevelVersion(opts: {
  level: DepLevel;
  pkg: PackageName;
  deps: Dependencies;
}): PackageRange | null {
  const { deps, level, pkg } = opts;
  const entries = deps[level];
  if (!entries) {
    return null;
  }
  return entries[pkg] || null;
}

function anyDepVersion(opts: {
  packageName: PackageName;
  deps: Dependencies;
}): PackageRange | null {
  const { deps, packageName } = opts;
  for (const level of DEP_LEVELS) {
    const entry = depLevelVersion({ deps, pkg: packageName, level });
    if (entry) {
      return entry;
    }
  }
  return null;
}

function effectiveRangeMin(range: PackageRange): PackageVersion {
  const ver = semver.coerce(range);
  if (!ver) {
    throw new Error(`Illegal package range "${range}"`);
  }
  return ver.version;
}

function depSatisfied(pkgDeps: Dependencies, [packageName, depRange]: DepPair) {
  const packageRequiredRange = anyDepVersion({
    packageName,
    deps: pkgDeps
  });

  if (!packageRequiredRange) return false;

  // console.log(
  //   packageName,
  //   packageRequiredRange,
  //   depRange,
  //   effectiveRangeMin(packageRequiredRange),
  //   effectiveRangeMin(depRange)
  // );

  return !semver.gt(
    effectiveRangeMin(depRange),
    effectiveRangeMin(packageRequiredRange)
  );
}

export function outOfDatePackages(args: {
  pkg: Dependencies;
  depSet: Dependencies;
}): Dependencies | null {
  const { depSet, pkg } = args;

  const unsatisfied = mapValues(depSet, (depMap: DepMap, level: DepLevel) =>
    pickBy(
      depMap,
      (depRange: PackageRange, pkgName: PackageName) =>
        !depSatisfied(pkg, [pkgName, depRange])
    )
  );
  const stripped = pickBy(unsatisfied, obj => obj && !isEmpty(obj)) as DepMap;
  return isEmpty(stripped) ? null : stripped;
}

function yarnAddFlag(level: DepLevel): string | null {
  switch (level) {
    case "dependencies":
      return null;
    case "devDependencies":
      return "-D";
    case "optionalDependencies":
      return "-O";
  }
}

function depMapToPairs(depMap: DepMap): Array<DepPair> {
  return map(depMap, (range, packageName): DepPair => [packageName, range]);
}

function yarnPackageVersionArg([name, range]: DepPair): string {
  return `${name}@${range}`;
}

export function upgradePlan(deps: Dependencies): CommandWithArgs[] {
  const result: CommandWithArgs[] = [];

  for (const key of DEP_LEVELS) {
    const levelDeps = deps[key];
    if (!levelDeps) continue;

    const depArgs = depMapToPairs(levelDeps).map(yarnPackageVersionArg);

    const yarnCommand = `yarnpkg add ${yarnAddFlag(key) || ""}`.trim();
    result.push([yarnCommand, depArgs]);
  }

  return result;
}
