import { test } from "node:test";
import assert from "node:assert/strict";
import { joinPinFromUrl } from "../src/native.js";
test("Android invitation links accept only real six digit rooms on trusted HTTPS domains", () => {
  assert.equal(
    joinPinFromUrl("https://ailecekeglen.com.tr/#join/123456"),
    "123456",
  );
  assert.equal(
    joinPinFromUrl("https://www.ailecekeglen.com.tr/join/123456"),
    "123456",
  );
  for (const url of [
    "https://evil.example/#join/123456",
    "http://ailecekeglen.com.tr/#join/123456",
    "https://ailecekeglen.com.tr.evil.example/#join/123456",
    "https://ailecekeglen.com.tr/#host/123456",
    "https://ailecekeglen.com.tr/#join/123456evil",
    "not a url",
  ])
    assert.equal(joinPinFromUrl(url), null);
});
