import { test } from "node:test";
import assert from "node:assert/strict";
import { stripHeader } from "../src/import-utils.js";
test("Turkish Excel headers are removed without discarding participant names", () => {
  for (const header of [
    "İsim",
    "İSİM",
    "Ad Soyad",
    "ADI SOYADI",
    "Katılımcı",
    "NAME",
    "\uFEFFİsim",
  ])
    assert.deepEqual(stripHeader([header, " Ayşe ", "Deniz"]), [
      "Ayşe",
      "Deniz",
    ]);
  assert.deepEqual(stripHeader(["Ada", "Ece", "Ada"]), ["Ada", "Ece", "Ada"]);
  assert.throws(() => stripHeader(["İsim"]), /bulunamadı/);
  assert.throws(() => stripHeader(Array(2001).fill("Ada")), /2.000/);
});
