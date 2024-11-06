import { mile𐃘add1 } from "./import_target";
import { mile𐃘add1 as m } from "./import_target";
import * as i from "./import_target";
import { test, expect } from "bun:test";
import { $ } from "bun";

test("unicode imports", () => {
  expect(mile𐃘add1(25)).toBe(26);
  expect(i.mile𐃘add1(25)).toBe(26);
  expect(m(25)).toBe(26);
});

// prettier-ignore
test("escaped unicode variable name", () => {
  let mile\u{100d8}value = 36;
  expect(mile𐃘value).toBe(36);
  expect(mile\u{100d8}value).toBe(36);
});

test("bun build --target=bun outputs only ascii", async () => {
  const build_result = await Bun.build({
    entrypoints: [import.meta.dirname + "/import_target.ts"],
    target: "bun",
  });
  expect(build_result.success).toBe(true);
  expect(build_result.outputs.length).toBe(1);
  for (const byte of new Uint8Array(await build_result.outputs[0].arrayBuffer())) {
    expect(byte).toBeLessThan(0x80);
  }
});

test("string escapes", () => {
  expect({ ["mile𐃘add1"]: 1 }?.mile𐃘add1).toBe(1);
  expect(`\\ ' " \` $ 𐃘`).toBe([0x5c, 0x27, 0x22, 0x60, 0x24, 0x100d8].map(c => String.fromCodePoint(c)).join(" "));
  expect({ "\\": 1 }[String.fromCodePoint(0x5c)]).toBe(1);
  const tag = (a: TemplateStringsArray) => a.raw;
  expect(tag`$one \$two`).toEqual(["$one \\$two"]);
});

test.skip("template literal raw property with unicode in an ascii-only build", async () => {
  expect(String.raw`你好𐃘\\`).toBe("你好𐃘\\\\");
  expect((await $`echo 你好𐃘`.text()).trim()).toBe("你好𐃘");
});
