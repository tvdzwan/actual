import * as monthUtils from './months';

test('range returns a full range', () => {
  expect(monthUtils.range('2016-10', '2018-01')).toMatchSnapshot();
});

test('getQuarter returns the quarter number for a given month', () => {
  expect(monthUtils.getQuarter('2024-01')).toBe(1);
  expect(monthUtils.getQuarter('2024-03')).toBe(1);
  expect(monthUtils.getQuarter('2024-04')).toBe(2);
  expect(monthUtils.getQuarter('2024-06')).toBe(2);
  expect(monthUtils.getQuarter('2024-07')).toBe(3);
  expect(monthUtils.getQuarter('2024-09')).toBe(3);
  expect(monthUtils.getQuarter('2024-10')).toBe(4);
  expect(monthUtils.getQuarter('2024-12')).toBe(4);
});

test('getQuarterStart and getQuarterEnd return the bounding months of the quarter', () => {
  expect(monthUtils.getQuarterStart('2024-02')).toBe('2024-01');
  expect(monthUtils.getQuarterEnd('2024-02')).toBe('2024-03');
  expect(monthUtils.getQuarterStart('2024-11')).toBe('2024-10');
  expect(monthUtils.getQuarterEnd('2024-11')).toBe('2024-12');
});

test('prevQuarter subtracts three months, landing in the previous quarter', () => {
  expect(monthUtils.prevQuarter('2024-02')).toBe('2023-11');
  expect(monthUtils.prevQuarter('2024-01')).toBe('2023-10');
  expect(monthUtils.prevQuarter('2024-04')).toBe('2024-01');
});

test('isValidYearMonthDay validates the day against the month and year', () => {
  expect(monthUtils.isValidYearMonthDay('2024-02-29')).toBe(true);
  expect(monthUtils.isValidYearMonthDay('2023-02-29')).toBe(false);
  expect(monthUtils.isValidYearMonthDay('2024-04-31')).toBe(false);
  expect(monthUtils.isValidYearMonthDay('2024-12-31')).toBe(true);
  expect(monthUtils.isValidYearMonthDay('2024-00-10')).toBe(false);
  expect(monthUtils.isValidYearMonthDay('2024-13-10')).toBe(false);
  expect(monthUtils.isValidYearMonthDay('2024-02-00')).toBe(false);
  expect(monthUtils.isValidYearMonthDay('2024-02')).toBe(false);
});

test('salaryMonth keeps the period aligned with the calendar month as much as possible', () => {
  expect(monthUtils.salaryMonth('2026-02-10', 15)).toBe('2026-02');
  expect(monthUtils.salaryMonth('2026-02-15', 15)).toBe('2026-03');
  expect(monthUtils.salaryMonth('2026-03-14', 15)).toBe('2026-03');
  expect(monthUtils.salaryMonth('2026-03-15', 15)).toBe('2026-04');
});

test('salaryPeriodMonth uses the salary day as the start of the active period', () => {
  expect(monthUtils.salaryPeriodMonth('2026-02-10', 15)).toBe('2026-02');
  expect(monthUtils.salaryPeriodMonth('2026-02-15', 15)).toBe('2026-03');
  expect(monthUtils.salaryPeriodMonth('2026-03-14', 15)).toBe('2026-03');
  expect(monthUtils.salaryPeriodMonth('2026-03-15', 15)).toBe('2026-04');
});

test('salaryPeriodStart and salaryPeriodEnd define the pay-cycle month boundaries', () => {
  expect(monthUtils.salaryPeriodStart('2026-02-10', 15)).toBe('2026-01-15');
  expect(monthUtils.salaryPeriodEnd('2026-02-10', 15)).toBe('2026-02-14');

  expect(monthUtils.salaryPeriodStart('2026-03-15', 15)).toBe('2026-03-15');
  expect(monthUtils.salaryPeriodEnd('2026-03-15', 15)).toBe('2026-04-14');
});

test('normalizeSalaryDay clamps values to a valid day range', () => {
  expect(monthUtils.normalizeSalaryDay(0)).toBe(1);
  expect(monthUtils.normalizeSalaryDay(1)).toBe(1);
  expect(monthUtils.normalizeSalaryDay(15)).toBe(15);
  expect(monthUtils.normalizeSalaryDay(31)).toBe(31);
  expect(monthUtils.normalizeSalaryDay(32)).toBe(31);
  expect(monthUtils.normalizeSalaryDay('18')).toBe(18);
  expect(monthUtils.normalizeSalaryDay('abc', 25)).toBe(25);
});
