import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { Role } from '../../common/enums/role.enum';
import { TicketStatus } from '../../common/enums/ticket-status.enum';
import { TicketPriority } from '../../common/enums/ticket-priority.enum';
import { TicketCategory } from '../../common/enums/ticket-category.enum';
import dataSource from '../data-source';

async function seed() {
  try {
    await dataSource.initialize();
    console.log('Data Source initialized');

    const userRepository = dataSource.getRepository(User);
    const ticketRepository = dataSource.getRepository(Ticket);

    // Clear existing data
    await ticketRepository.delete({});
    await userRepository.delete({});

    // Create Admin user
    const adminPassword = await bcrypt.hash('admin123456', 10);
    const admin = userRepository.create({
      username: 'admin',
      password: adminPassword,
      fullname: 'System Administrator',
      email: 'admin@ticketing.com',
      phoneNumber: '+1234567890',
      roles: [Role.ADMIN, Role.AGENT],
      isDisabled: false,
    });
    await userRepository.save(admin);
    console.log('Admin user created');

    // Create Agent users
    const agent1Password = await bcrypt.hash('agent123456', 10);
    const agent1 = userRepository.create({
      username: 'agent1',
      password: agent1Password,
      fullname: 'John Agent',
      email: 'john.agent@ticketing.com',
      phoneNumber: '+1234567891',
      roles: [Role.AGENT],
      isDisabled: false,
    });
    await userRepository.save(agent1);

    const agent2Password = await bcrypt.hash('agent123456', 10);
    const agent2 = userRepository.create({
      username: 'agent2',
      password: agent2Password,
      fullname: 'Jane Agent',
      email: 'jane.agent@ticketing.com',
      phoneNumber: '+1234567892',
      roles: [Role.AGENT],
      isDisabled: false,
    });
    await userRepository.save(agent2);
    console.log('Agent users created');

    // Create regular users
    const user1Password = await bcrypt.hash('user123456', 10);
    const user1 = userRepository.create({
      username: 'user1',
      password: user1Password,
      fullname: 'Bob User',
      email: 'bob.user@ticketing.com',
      phoneNumber: '+1234567893',
      workstationNumber: 'WS-001',
      roles: [Role.USER],
      isDisabled: false,
    });
    await userRepository.save(user1);

    const user2Password = await bcrypt.hash('user123456', 10);
    const user2 = userRepository.create({
      username: 'user2',
      password: user2Password,
      fullname: 'Alice User',
      email: 'alice.user@ticketing.com',
      phoneNumber: '+1234567894',
      workstationNumber: 'WS-002',
      roles: [Role.USER],
      isDisabled: false,
    });
    await userRepository.save(user2);
    console.log('Regular users created');

    // Create sample tickets
    const ticket1 = ticketRepository.create({
      title: 'Computer not turning on',
      description: 'My workstation computer is not powering on. I tried checking the power cable and it seems fine.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      category: TicketCategory.HARDWARE,
      workstationNumber: 'WS-001',
      createdById: user1.id,
      assignedToId: agent1.id,
    });
    await ticketRepository.save(ticket1);

    const ticket2 = ticketRepository.create({
      title: 'Cannot access email',
      description: 'I am unable to log into my email account. Getting authentication error.',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.MEDIUM,
      category: TicketCategory.EMAIL,
      workstationNumber: 'WS-002',
      createdById: user2.id,
      assignedToId: agent2.id,
    });
    await ticketRepository.save(ticket2);

    const ticket3 = ticketRepository.create({
      title: 'Software installation request',
      description: 'Need Adobe Photoshop installed on my machine for design work.',
      status: TicketStatus.PENDING,
      priority: TicketPriority.LOW,
      category: TicketCategory.SOFTWARE,
      workstationNumber: 'WS-001',
      createdById: user1.id,
      assignedToId: agent1.id,
    });
    await ticketRepository.save(ticket3);

    const ticket4 = ticketRepository.create({
      title: 'Network connection issues',
      description: 'Intermittent network connectivity. Connection drops every few minutes.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.URGENT,
      category: TicketCategory.NETWORK,
      workstationNumber: 'WS-002',
      createdById: user2.id,
    });
    await ticketRepository.save(ticket4);

    const ticket5 = ticketRepository.create({
      title: 'Printer not working',
      description: 'The office printer on the 3rd floor is showing a paper jam error but there is no paper stuck.',
      status: TicketStatus.RESOLVED,
      priority: TicketPriority.MEDIUM,
      category: TicketCategory.PRINTER,
      createdById: user1.id,
      assignedToId: agent2.id,
      resolvedAt: new Date(),
    });
    await ticketRepository.save(ticket5);

    console.log('Sample tickets created');

    console.log('\n=== Seed completed successfully ===');
    console.log('\nDefault users created:');
    console.log('Admin: username=admin, password=admin123456');
    console.log('Agent 1: username=agent1, password=agent123456');
    console.log('Agent 2: username=agent2, password=agent123456');
    console.log('User 1: username=user1, password=user123456');
    console.log('User 2: username=user2, password=user123456');

    await dataSource.destroy();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
