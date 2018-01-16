import { Lens } from "@atomic-object/lenses";

export const aLens = Lens.from<{ foo: string }>().prop("foo");
