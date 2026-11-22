const MONTHS_RU = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

export interface EmploymentPeriod {
  startDate: Date;
  endDate: Date | null;
}

export const isOngoing = (period: EmploymentPeriod): boolean => period.endDate === null;

export const formatMonth = (date: Date): string =>
  `${MONTHS_RU[date.getUTCMonth()]} ${date.getUTCFullYear()}`;

export const formatPeriod = (period: EmploymentPeriod): string =>
  `${formatMonth(period.startDate)} — ${
    period.endDate ? formatMonth(period.endDate) : 'настоящее время'
  }`;

export function durationInMonths(period: EmploymentPeriod, now: Date = new Date()): number {
  const start = period.startDate;
  const end = period.endDate ?? now;
  return (
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (end.getUTCMonth() - start.getUTCMonth()) +
    1
  );
}
