import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as money from '../dist/esm/money.js';

const amounts = [0, 5, 1000, 25000, 1500000, -750];

test('money.parse(format(n)) === n', () => {
  for (const amount of amounts) {
    const formatted = money.format(amount);
    const parsed = money.parse(formatted);

    assert.equal(
      parsed,
      amount,
      `Round-trip failed for ${amount}: "${formatted}" became ${parsed}`
    );
  }
});

test('money.parse handles unusual inputs', () => {
  // Currency label before the amount
  assert.throws(() => money.parse('FCFA 1000'));

  // Multiple spaces inside the amount
  assert.throws(() => money.parse('1  000'));

  // Explicit positive sign
  assert.throws(() => money.parse('+1000'));

  // Space between negative sign and amount
  assert.throws(() => money.parse('- 1000'));

  // Scientific and hexadecimal notation
  assert.throws(() => money.parse('1e3'));
  assert.throws(() => money.parse('0x10'));

  // Leading zeros
  assert.equal(money.parse('00123'), 123);

  // Trailing newline and tab
  assert.equal(money.parse('1 000\n'), 1000);
  assert.equal(money.parse('1 000\t'), 1000);

  // Very large amount
  assert.throws(
    () => money.parse('12345678901234567'),
    RangeError
  );

  // Invalid input types
  assert.throws(() => money.parse(null), TypeError);
  assert.throws(() => money.parse(undefined), TypeError);
  assert.throws(() => money.parse(12345), TypeError);
});

// Currency-like letters in unexpected positions
//assert.throws(() => money.parse('1F00'));
test('money.parse rejects 1000ABC', () => {
  assert.throws(() => money.parse('1000ABC'));
});

test('money.parse rejects 12F34', () => {
  assert.throws(() => money.parse('12F34'));
});

test('money.parse rejects 1F000', () => {
  assert.throws(() => money.parse('1F000'));
});
