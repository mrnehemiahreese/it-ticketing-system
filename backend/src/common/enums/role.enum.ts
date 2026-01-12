import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  USER = 'USER',
}

registerEnumType(Role, {
  name: 'Role',
  description: 'User roles in the system',
});
