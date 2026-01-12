import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketWatcher } from './entities/ticket-watcher.entity';
import { User } from '../users/entities/user.entity';
import { SlackService } from '../slack/slack.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TicketStatus } from '../common/enums/ticket-status.enum';
import { TicketPriority } from '../common/enums/ticket-priority.enum';
import { TicketCategory } from '../common/enums/ticket-category.enum';
import { Role } from '../common/enums/role.enum';

describe('TicketsService', () => {
  let service: TicketsService;
  let ticketsRepository: any;
  let watchersRepository: any;
  let usersRepository: any;
  let slackService: any;

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    roles: [Role.USER],
  };

  const mockAgent = {
    id: 'agent-123',
    username: 'testagent',
    email: 'agent@example.com',
    roles: [Role.AGENT],
  };

  const mockAdmin = {
    id: 'admin-123',
    username: 'testadmin',
    email: 'admin@example.com',
    roles: [Role.ADMIN],
  };

  const mockTicket = {
    id: 'ticket-123',
    ticketNumber: 'TKT-000001',
    title: 'Test Ticket',
    description: 'Test description',
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
    category: TicketCategory.SOFTWARE,
    createdById: 'user-123',
    assignedToId: null,
    createdBy: mockUser,
    assignedTo: null,
    comments: [],
    attachments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockTicketsRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockTicket]),
      })),
    };

    const mockWatchersRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
    };

    const mockUsersRepository = {
      findOne: jest.fn(),
    };

    const mockSlackService = {
      notifyTicketCreated: jest.fn().mockResolvedValue('thread-123'),
      notifyTicketUpdated: jest.fn().mockResolvedValue(undefined),
      notifyAssignment: jest.fn().mockResolvedValue(undefined),
      notifyUserMarkedResolved: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: getRepositoryToken(Ticket), useValue: mockTicketsRepository },
        { provide: getRepositoryToken(TicketWatcher), useValue: mockWatchersRepository },
        { provide: getRepositoryToken(User), useValue: mockUsersRepository },
        { provide: SlackService, useValue: mockSlackService },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    ticketsRepository = module.get(getRepositoryToken(Ticket));
    watchersRepository = module.get(getRepositoryToken(TicketWatcher));
    usersRepository = module.get(getRepositoryToken(User));
    slackService = module.get(SlackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new ticket with auto-generated ticket number', async () => {
      ticketsRepository.count.mockResolvedValue(0);
      ticketsRepository.create.mockReturnValue(mockTicket);
      ticketsRepository.save.mockResolvedValue(mockTicket);
      ticketsRepository.findOne.mockResolvedValue(mockTicket);

      const result = await service.create(
        {
          title: 'Test Ticket',
          description: 'Test description',
          priority: TicketPriority.MEDIUM,
          category: TicketCategory.SOFTWARE,
        },
        'user-123',
      );

      expect(result).toBeDefined();
      expect(ticketsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Ticket',
          ticketNumber: 'TKT-000001',
          status: TicketStatus.OPEN,
        }),
      );
      expect(slackService.notifyTicketCreated).toHaveBeenCalled();
    });

    it('should generate sequential ticket numbers', async () => {
      ticketsRepository.count.mockResolvedValue(99);
      ticketsRepository.create.mockReturnValue(mockTicket);
      ticketsRepository.save.mockResolvedValue(mockTicket);
      ticketsRepository.findOne.mockResolvedValue(mockTicket);

      await service.create(
        {
          title: 'Test',
          description: 'Test',
          priority: TicketPriority.LOW,
          category: TicketCategory.OTHER,
        },
        'user-123',
      );

      expect(ticketsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ticketNumber: 'TKT-000100',
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a ticket by id', async () => {
      ticketsRepository.findOne.mockResolvedValue(mockTicket);

      const result = await service.findOne('ticket-123', null);

      expect(result).toEqual(mockTicket);
    });

    it('should throw NotFoundException for non-existent ticket', async () => {
      ticketsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id', null)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should allow owner to view their ticket', async () => {
      ticketsRepository.findOne.mockResolvedValue(mockTicket);

      const result = await service.findOne('ticket-123', mockUser as any);

      expect(result).toEqual(mockTicket);
    });

    it('should throw ForbiddenException for unauthorized user', async () => {
      const otherUser = { ...mockUser, id: 'other-user' };
      ticketsRepository.findOne.mockResolvedValue(mockTicket);

      await expect(
        service.findOne('ticket-123', otherUser as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to view any ticket', async () => {
      ticketsRepository.findOne.mockResolvedValue(mockTicket);

      const result = await service.findOne('ticket-123', mockAdmin as any);

      expect(result).toEqual(mockTicket);
    });

    it('should allow agent to view any ticket', async () => {
      ticketsRepository.findOne.mockResolvedValue(mockTicket);

      const result = await service.findOne('ticket-123', mockAgent as any);

      expect(result).toEqual(mockTicket);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      ticketsRepository.findOne.mockResolvedValue(mockTicket);
      ticketsRepository.save.mockImplementation((ticket) =>
        Promise.resolve(ticket),
      );
    });

    it('should allow owner to update their ticket', async () => {
      const result = await service.update(
        'ticket-123',
        { title: 'Updated Title' },
        mockUser as any,
      );

      expect(result).toBeDefined();
    });

    it('should set resolvedAt when status changes to RESOLVED', async () => {
      await service.update(
        'ticket-123',
        { status: TicketStatus.RESOLVED },
        mockUser as any,
      );

      expect(ticketsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: TicketStatus.RESOLVED,
          resolvedAt: expect.any(Date),
        }),
      );
    });

    it('should notify Slack on status change', async () => {
      await service.update(
        'ticket-123',
        { status: TicketStatus.IN_PROGRESS },
        mockAgent as any,
      );

      expect(slackService.notifyTicketUpdated).toHaveBeenCalled();
    });

    it('should throw ForbiddenException for unauthorized update', async () => {
      const otherUser = { ...mockUser, id: 'other-user' };

      await expect(
        service.update('ticket-123', { title: 'Hacked' }, otherUser as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      ticketsRepository.findOne.mockResolvedValue(mockTicket);
    });

    it('should allow owner to delete their ticket', async () => {
      const result = await service.remove('ticket-123', mockUser as any);

      expect(result).toBe(true);
      expect(ticketsRepository.remove).toHaveBeenCalled();
    });

    it('should allow admin to delete any ticket', async () => {
      const result = await service.remove('ticket-123', mockAdmin as any);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException for non-owner non-admin', async () => {
      await expect(
        service.remove('ticket-123', mockAgent as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('assignTicket', () => {
    beforeEach(() => {
      ticketsRepository.findOne.mockResolvedValue(mockTicket);
      ticketsRepository.save.mockImplementation((t) => Promise.resolve(t));
      usersRepository.findOne.mockResolvedValue(mockAgent);
    });

    it('should allow agent to assign ticket', async () => {
      const result = await service.assignTicket(
        'ticket-123',
        'agent-123',
        mockAgent as any,
      );

      expect(result).toBeDefined();
      expect(slackService.notifyAssignment).toHaveBeenCalled();
    });

    it('should allow admin to assign ticket', async () => {
      const result = await service.assignTicket(
        'ticket-123',
        'agent-123',
        mockAdmin as any,
      );

      expect(result).toBeDefined();
    });

    it('should throw ForbiddenException for regular user', async () => {
      await expect(
        service.assignTicket('ticket-123', 'agent-123', mockUser as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for invalid assignee', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.assignTicket('ticket-123', 'invalid-user', mockAdmin as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTicketStats', () => {
    it('should return ticket statistics', async () => {
      ticketsRepository.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(30) // open
        .mockResolvedValueOnce(20) // in progress
        .mockResolvedValueOnce(25) // resolved
        .mockResolvedValueOnce(25); // closed

      const result = await service.getTicketStats();

      expect(result).toEqual({
        total: 100,
        open: 30,
        inProgress: 20,
        resolved: 25,
        closed: 25,
      });
    });
  });

  

  describe('watchers', () => {
    it('should add a watcher to a ticket', async () => {
      watchersRepository.findOne.mockResolvedValue(null);
      watchersRepository.create.mockReturnValue({ ticketId: 'ticket-123', userId: 'user-123' });
      watchersRepository.save.mockResolvedValue({ ticketId: 'ticket-123', userId: 'user-123' });

      const result = await service.addWatcher('ticket-123', 'user-123');

      expect(result).toBeDefined();
    });

    it('should return existing watcher if already watching', async () => {
      const existingWatcher = { ticketId: 'ticket-123', userId: 'user-123' };
      watchersRepository.findOne.mockResolvedValue(existingWatcher);

      const result = await service.addWatcher('ticket-123', 'user-123');

      expect(result).toEqual(existingWatcher);
      expect(watchersRepository.create).not.toHaveBeenCalled();
    });

    it('should remove a watcher', async () => {
      const watcher = { ticketId: 'ticket-123', userId: 'user-123' };
      watchersRepository.findOne.mockResolvedValue(watcher);

      const result = await service.removeWatcher('ticket-123', 'user-123');

      expect(result).toBe(true);
      expect(watchersRepository.remove).toHaveBeenCalledWith(watcher);
    });
  });
});
