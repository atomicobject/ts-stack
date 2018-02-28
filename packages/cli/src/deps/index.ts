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
import {
  mapValues,
  pickBy,
  some,
  isEmpty,
  map,
  flatMap,
  isString
} from "lodash";
import * as semver from "semver";
import { crossSpawn, spawnWithEnv, shellEscape } from "../spawn";
import { Isomorphism } from "@atomic-object/lenses";

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

export function unionDepMaps(dependencies: DepMap[]): DepMap {
  return depMapPairsIso.from(
    flatMap(dependencies, deps => depMapPairsIso.to(deps))
  );
}

export function unionDeps(dependencies: Dependencies[]): Dependencies {
  const result: Dependencies = {};
  for (const level of DEP_LEVELS) {
    result[level] = unionDepMaps(dependencies.map(deps => deps[level] || {}));
  }
  return stripEmpty(result);
}

export function outOfDatePackages(args: {
  pkg: Dependencies;
  depSet: Dependencies;
}): Dependencies | null {
  const { depSet, pkg } = args;

  const unsatisfied = mapValues(depSet, (depMap, level) =>
    pickBy(
      depMap,
      (depRange, pkgName) => !depSatisfied(pkg, [pkgName, depRange])
    )
  ) as Dependencies;
  const stripped = stripEmpty(unsatisfied);
  return isEmpty(stripped) ? null : stripped;
}

function stripEmpty(deps: Partial<Dependencies>): Dependencies {
  return pickBy(deps, obj => obj && !isEmpty(obj)) as DepMap;
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

const depMapPairsIso: Isomorphism<DepMap, DepPair[]> = {
  from: pairs =>
    pairs.reduce(
      (map, [packageName, packageRange]) => {
        map[packageName] = packageRange;
        return map;
      },
      {} as DepMap
    ),

  to: depMap =>
    map(depMap, (range, packageName): DepPair => [packageName, range])
};

function yarnPackageVersionArg([name, range]: DepPair): string {
  return `${name}@${range}`;
}

export function upgradePlan(deps: Dependencies): CommandWithArgs[] {
  const result: CommandWithArgs[] = [];

  for (const key of DEP_LEVELS) {
    const levelDeps = deps[key];
    if (!levelDeps) continue;

    const depArgs = depMapPairsIso.to(levelDeps).map(yarnPackageVersionArg);

    const flag = yarnAddFlag(key);
    const yarnArgs = ["add", flag, ...depArgs].filter(isString);
    result.push(["yarnpkg", yarnArgs]);
  }

  return result;
}
