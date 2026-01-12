import { registerEnumType } from '@nestjs/graphql';

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED',
}

registerEnumType(TicketStatus, {
  name: 'TicketStatus',
  description: 'Status of a ticket',
});
