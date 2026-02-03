import { registerEnumType } from '@nestjs/graphql';

export enum TicketCategory {
  // Hardware - covers Printer, Scanner, F/S Drive, Flash drive
  HARDWARE = 'HARDWARE',
  // General Software issues
  SOFTWARE = 'SOFTWARE',
  // Forte/RenewGov accounting software (TM Consulting specific)
  FORTE = 'FORTE',
  // Accounting/Financial Support
  ACCOUNTING = 'ACCOUNTING',
  // Bug Report - top level for quick access
  BUG_REPORT = 'BUG_REPORT',
  // Billing Questions
  BILLING = 'BILLING',
  // Other/Miscellaneous
  OTHER = 'OTHER',
}

registerEnumType(TicketCategory, {
  name: 'TicketCategory',
  description: 'Category of a ticket',
});
