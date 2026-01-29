import { registerEnumType } from "@nestjs/graphql";

export enum TicketSource {
  PORTAL = "PORTAL",
  EMAIL = "EMAIL",
  SLACK = "SLACK",
}

registerEnumType(TicketSource, {
  name: "TicketSource",
  description: "How the ticket was created",
});
