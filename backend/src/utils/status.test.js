const test = require('node:test');
const assert = require('node:assert/strict');
const { computeStatus, drivingDate } = require('./status');

const TODAY = new Date('2026-07-08T00:00:00Z');

test('drivingDate picks the sooner of eol/eos', () => {
  assert.equal(drivingDate('2030-01-01', '2027-01-01'), '2027-01-01');
  assert.equal(drivingDate('2027-01-01', '2030-01-01'), '2027-01-01');
  assert.equal(drivingDate(null, '2027-01-01'), '2027-01-01');
  assert.equal(drivingDate('2027-01-01', null), '2027-01-01');
  assert.equal(drivingDate(null, null), null);
});

test('status is Unknown when both dates are missing', () => {
  assert.equal(computeStatus(null, null, TODAY), 'Unknown');
});

test('status is Critical when the sooner date is under 30 days out', () => {
  // eol is far away, but eos is 10 days out -> worst case wins
  assert.equal(computeStatus('2030-01-01', '2026-07-18', TODAY), 'Critical');
});

test('status is Critical for dates already in the past', () => {
  assert.equal(computeStatus('2020-01-01', null, TODAY), 'Critical');
});

test('status is Approaching between 30 and 90 days out', () => {
  assert.equal(computeStatus('2026-09-01', null, TODAY), 'Approaching');
});

test('status is OK when 90+ days out', () => {
  assert.equal(computeStatus('2028-01-01', '2028-06-01', TODAY), 'OK');
});
