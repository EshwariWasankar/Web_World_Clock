import { describe, expect, it } from 'vitest';
import { formatTime, shouldTriggerAlarm } from './clockUtils';

describe('clock utilities', () => {
  it('formats a date into a readable digital time', () => {
    const date = new Date('2024-01-02T03:04:05Z');
    expect(formatTime(date, 'America/New_York', true)).toContain('22:04');
  });

  it('supports 12-hour formatting when requested', () => {
    const date = new Date('2024-01-02T03:04:05Z');
    expect(formatTime(date, 'America/New_York', false, false)).toContain('10:04');
  });

  it('triggers alarms when current time matches', () => {
    const now = new Date('2024-01-02T03:04:05Z');
    const alarm = { id: 1, time: '03:04', timezone: 'UTC' };
    expect(shouldTriggerAlarm(alarm, now, 'UTC')).toBe(true);
  });
});
