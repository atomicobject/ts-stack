import { outOfDate, Dependencies } from "..";

describe("outOfDatePackages", () => {
  it("Keeps deps whose min value is greater than the required min value", () => {
    const result = outOfDate({
      current: {
        dependencies: {
          react: "^15.5.0",
          jest: "^22"
        }
      },
      desired: {
        dependencies: {
          react: "^16",
          jest: "^21",
          webpack: "^4"
        }
      }
    });

    const expected: Dependencies = {
      dependencies: {
        react: "^16",
        webpack: "^4"
      }
    };
    expect(result).toEqual(expected);
  });

  it("strips empty dep categories", () => {
    const result = outOfDate({
      current: {
        dependencies: {
          react: "^15.5.0"
        },
        devDependencies: {
          jest: "^22"
        }
      },
      desired: {
        dependencies: {
          react: "^16"
        },
        devDependencies: {
          jest: "^21"
        }
      }
    });

    const expected: Dependencies = {
      dependencies: {
        react: "^16"
      }
    };
    expect(result).toEqual(expected);
  });

  it("returns null if everything is up to date", () => {
    const result = outOfDate({
      current: {
        dependencies: {
          jest: "^22"
        }
      },
      desired: {
        dependencies: {
          jest: "^21"
        }
      }
    });

    expect(result).toEqual({});
  });
});
