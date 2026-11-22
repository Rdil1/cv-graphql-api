import { durationInMonths, formatPeriod, isOngoing } from './experience-period';

const month = (y: number, m: number) => new Date(Date.UTC(y, m - 1, 1));

describe('experience period', () => {
  it('formats a closed period in Russian', () => {
    expect(formatPeriod({ startDate: month(2025, 1), endDate: month(2025, 9) })).toBe(
      'Январь 2025 — Сентябрь 2025',
    );
  });

  it('formats an ongoing period', () => {
    const period = { startDate: month(2025, 11), endDate: null };
    expect(isOngoing(period)).toBe(true);
    expect(formatPeriod(period)).toBe('Ноябрь 2025 — настоящее время');
  });

  it('counts months inclusively, including year boundaries', () => {
    expect(durationInMonths({ startDate: month(2025, 1), endDate: month(2025, 9) })).toBe(9);
    expect(durationInMonths({ startDate: month(2023, 9), endDate: month(2024, 5) })).toBe(9);
    expect(durationInMonths({ startDate: month(2025, 11), endDate: null }, month(2026, 2))).toBe(4);
  });
});
