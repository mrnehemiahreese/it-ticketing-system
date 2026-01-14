import { registerEnumType } from '@nestjs/graphql';

// Legacy enum - kept for backwards compatibility
// New tickets should use the dynamic TicketCategory entity
export enum TicketCategoryEnum {
  HARDWARE = 'HARDWARE',
  SOFTWARE = 'SOFTWARE',
  NETWORK = 'NETWORK',
  ACCESS = 'ACCESS',
  EMAIL = 'EMAIL',
  PRINTER = 'PRINTER',
  PHONE = 'PHONE',
  OTHER = 'OTHER',
}

registerEnumType(TicketCategoryEnum, {
  name: 'TicketCategoryEnum',
  description: 'Legacy category enum (deprecated - use dynamic categories)',
});

// Re-export as TicketCategory for backwards compatibility
export { TicketCategoryEnum as TicketCategory };
