import type { ITimeProvider } from './time-provider.interface.js';

export class TimeProvider implements ITimeProvider {
  now(): Date {
    return new Date();
  }

  startOfMonth(): Date {
    const date = new Date();
    date.setUTCDate(1);
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }

  startOfDay(): Date {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }
}
