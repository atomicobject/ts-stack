import {updateIn} from "../index";

describe("updateIn", () => {
  it("creates a copy with an update and 1 key", () => {
    let f = { foo: "x"};
    const f2 = updateIn(f, 'foo', 'y');
    expect(f2).toEqual({foo: "y"});
  })

  it("creates a copy with an update and 2 keys", () => {
    let f = { foo: { bar: "x"}};
    const f2 = updateIn(f, 'foo', 'bar', 'y');
    expect(f2).toEqual({foo: {bar: "y"}});
  })

  it("creates a copy with an update and 3 keys", () => {
    let f = { foo: { bar: {baz: "x"}}};
    const f2 = updateIn(f, 'foo', 'bar', 'baz', 'y');
    expect(f2).toEqual({foo: {bar: {baz: "y"}}});
  })

  it("creates a copy with an update and 4 keys", () => {
    let f = { foo: { bar: {baz: {qux: "x"}}}};
    const f2 = updateIn(f, 'foo', 'bar', 'baz', 'qux', 'y');
    expect(f2).toEqual({foo: {bar: {baz: {qux: "y"}}}});
  })

  it("creates a copy with an update and 5 keys", () => {
    let f = { foo: { bar: {baz: {qux: {quux: "x"}}}}};
    const f2 = updateIn(f, 'foo', 'bar', 'baz', 'qux', 'quux', 'y');
    expect(f2).toEqual({foo: {bar: {baz: {qux: {quux: "y"}}}}});
  })
})