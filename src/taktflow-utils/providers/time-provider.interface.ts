export interface ITimeProvider {
  now(): Date;
  startOfMonth(): Date;
  startOfDay(): Date;
}
