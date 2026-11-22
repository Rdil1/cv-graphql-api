import { Injectable } from '@nestjs/common';
import { EmploymentPeriod, durationInMonths, formatPeriod, isOngoing } from './experience-period';

@Injectable()
export class ExperienceService {
  isCurrent(period: EmploymentPeriod): boolean {
    return isOngoing(period);
  }

  formatPeriod(period: EmploymentPeriod): string {
    return formatPeriod(period);
  }

  durationMonths(period: EmploymentPeriod): number {
    return durationInMonths(period, new Date());
  }
}
