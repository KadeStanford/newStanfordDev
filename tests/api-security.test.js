const test = require("node:test");
const assert = require("node:assert/strict");
const {
  getClientAddress,
  hashIdentifier,
  jsonSize,
  secretsMatch,
} = require("../lib/apiSecurity");

test("uses the first trusted proxy address and strips an IPv4 port", () => {
  const req = {
    headers: { "x-forwarded-for": "203.0.113.9:443, 10.0.0.1" },
    socket: {},
  };
  assert.equal(getClientAddress(req), "203.0.113.9");
});

test("hashes identifiers without retaining the source value", () => {
  const result = hashIdentifier("203.0.113.9", "contact");
  assert.match(result, /^[a-f0-9]{64}$/);
  assert.notEqual(result, "203.0.113.9");
  assert.equal(result, hashIdentifier("203.0.113.9", "contact"));
  assert.notEqual(result, hashIdentifier("203.0.113.9", "analytics"));
});

test("compares secrets without accepting missing or partial values", () => {
  assert.equal(secretsMatch("correct", "correct"), true);
  assert.equal(secretsMatch("cor", "correct"), false);
  assert.equal(secretsMatch("incorrect", "correct"), false);
  assert.equal(secretsMatch(undefined, "correct"), false);
});

test("measures serialized request payload size", () => {
  assert.equal(jsonSize({ message: "hello" }), 19);
});
