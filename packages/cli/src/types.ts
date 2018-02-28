import { Package } from "read-pkg-up";

/** statically assert that the second type is assignable to the first type. */
export interface AssertAssignable<T, U extends T> {}

/** Used by Flavor to mark a type in a readable way. */
export interface Flavoring<FlavorT> {
  _type?: FlavorT;
}
/** Create a "flavored" version of a type. TypeScript will disallow mixing flavors, but will allow unflavored values of that type to be passed in where a flavored version is expected. This is a less restrictive form of branding. */
export type Flavor<T, FlavorT> = T & Flavoring<FlavorT>;

export type FilePath = Flavor<string, "file path">;
export type DirPath = Flavor<string, "directory path">;
export type CommandString = Flavor<
  string,
  "a command which can be run in the shell"
>;

export type CommandWithArgs = [CommandString, Array<string>];

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

export type PackageName = Flavor<string, "An NPM package name">;
export type PackageRange = Flavor<string, "An NPM package version range">;
export type PackageVersion = Flavor<string, "A specific  NPM package version">;

export type PackageJson = Package;
type _assertPackageIsDeps = AssertAssignable<Dependencies, PackageJson>;
