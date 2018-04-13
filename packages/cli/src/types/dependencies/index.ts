import { Flavor, PackageName, PackageRange, PackageVersion } from "..";

import { Isomorphism } from "@atomic-object/lenses";
import * as semver from "semver";
import {
  mapValues,
  pickBy,
  some,
  isEmpty as objIsEmpty,
  map,
  flatMap,
  isString
} from "lodash";

export type DepLevel =
  | "dependencies"
  | "devDependencies"
  | "optionalDependencies";

export const DEP_LEVELS: ReadonlyArray<DepLevel> = [
  "dependencies",
  "devDependencies",
  "optionalDependencies"
];

export type DepMap = Flavor<
  { [name: string]: string },
  "dependency package/version range map"
>;
export type Dependencies = {
  bundleDependencies?: DepMap;
  dependencies?: DepMap;
  devDependencies?: DepMap;
  optionalDependencies?: DepMap;
};
export type DepPair = [PackageName, PackageRange];

/** Return the specified version of a package if it exists in the specified DepLevel. */
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

/** Return the depended-upon version of a package from any DepLevel */
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

/** Check if a dependency is satisfied by a given set of Dependencies */
export function depSatisfied(current: Dependencies, desired: DepPair) {
  const [packageName, depRange] = desired;
  const packageRequiredRange = anyDepVersion({
    packageName,
    deps: current
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

/** Compute the union of a set of DepMaps */
export function unionDepMaps(dependencies: DepMap[]): DepMap {
  return depMapPairsIso.from(
    flatMap(dependencies, deps => depMapPairsIso.to(deps))
  );
}

/** Compute the union of a set of Dependencies */
export function union(dependencies: Dependencies[]): Dependencies {
  const result: Dependencies = {};
  for (const level of DEP_LEVELS) {
    result[level] = unionDepMaps(dependencies.map(deps => deps[level] || {}));
  }
  return stripEmpty(result);
}

/** Given a PackageRange, return the minimum version allowed. */
function effectiveRangeMin(range: PackageRange): PackageVersion {
  const ver = semver.coerce(range);
  if (!ver) {
    throw new Error(`Illegal package range "${range}"`);
  }
  return ver.version;
}

/** Remove empty DepMap from a Dependencies */
export function stripEmpty(deps: Dependencies): Dependencies {
  return pickBy(deps, obj => obj && !isEmpty(obj)) as DepMap;
}

/** Isomorphism between DepMap and DepPair. to: DepPair[] -> DepMap. from: DepMap -> DepPair[] */
export const depMapPairsIso: Isomorphism<DepMap, DepPair[]> = {
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

/** Given a set of dependencies from a package and a desired dependency set, return the set of dependencies which need to be updated. */
export function outOfDate(args: {
  current: Dependencies;
  desired: Dependencies;
}): Dependencies {
  const { desired, current } = args;

  const unsatisfied = mapValues(desired, (depMap, level) =>
    pickBy(
      depMap,
      (depRange, pkgName) => !depSatisfied(current, [pkgName, depRange])
    )
  ) as Dependencies;
  return stripEmpty(unsatisfied);
}

export function isEmpty(deps: Dependencies) {
  return objIsEmpty(deps);
}
