import {describe, expect, test} from 'vitest';
import {
  getUsageRecordPreviousReportingPeriod,
  getUsageRecordReportingPeriod,
} from './utils.js';

describe('usageRecords utils', () => {
  test('getUsageRecordPreviousReportingPeriod returns month and year', () => {
    const previous = getUsageRecordPreviousReportingPeriod({month: 5, year: 2024});

    expect(previous).toEqual({month: 4, year: 2024});
    expect(previous).not.toHaveProperty('getTime');
  });

  test('getUsageRecordPreviousReportingPeriod rolls over January', () => {
    const previous = getUsageRecordPreviousReportingPeriod({month: 0, year: 2024});

    expect(previous).toEqual({month: 11, year: 2023});
  });

  test('getUsageRecordReportingPeriod matches current date', () => {
    const date = new Date();
    const period = getUsageRecordReportingPeriod();

    expect(period).toEqual({
      month: date.getMonth(),
      year: date.getFullYear(),
    });
  });
});
