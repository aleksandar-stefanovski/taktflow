export interface IConsumerHealth {
  consumerId: string;
  total:      number;
  pending:    number;
  processing: number;
  delivered:  number;
  failed:     number;
  deadLetter: number;
}
