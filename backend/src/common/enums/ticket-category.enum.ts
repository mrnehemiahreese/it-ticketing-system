import { registerEnumType } from '@nestjs/graphql';

export enum TicketCategory {
  HARDWARE = 'HARDWARE',
  SOFTWARE = 'SOFTWARE',
  NETWORK = 'NETWORK',
  ACCESS = 'ACCESS',
  EMAIL = 'EMAIL',
  PRINTER = 'PRINTER',
  PHONE = 'PHONE',
  OTHER = 'OTHER',
}

registerEnumType(TicketCategory, {
  name: 'TicketCategory',
  description: 'Category of a ticket',
});
