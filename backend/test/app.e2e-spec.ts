import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('IT Ticketing System (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let adminToken: string;
  let testTicketId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              login(loginInput: { username: "admin", password: "Admin123!" }) {
                accessToken
                user {
                  id
                  username
                  roles
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.data.login.accessToken).toBeDefined();
      expect(response.body.data.login.user.username).toBe('admin');
      adminToken = response.body.data.login.accessToken;
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              login(loginInput: { username: "admin", password: "wrongpassword" }) {
                accessToken
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe('Invalid credentials');
    });

    it('should register a new user', async () => {
      const uniqueUsername = `testuser_${Date.now()}`;
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              register(registerInput: {
                username: "${uniqueUsername}"
                password: "Test123!"
                email: "${uniqueUsername}@test.com"
                fullname: "Test User"
              }) {
                accessToken
                user {
                  username
                  roles
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.data.register.accessToken).toBeDefined();
      expect(response.body.data.register.user.roles).toContain('USER');
      accessToken = response.body.data.register.accessToken;
    });
  });

  describe('Tickets', () => {
    it('should create a ticket', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `
            mutation {
              createTicket(createTicketInput: {
                title: "E2E Test Ticket"
                description: "This is an e2e test ticket"
                priority: MEDIUM
                category: SOFTWARE
              }) {
                id
                ticketNumber
                title
                status
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.data.createTicket.id).toBeDefined();
      expect(response.body.data.createTicket.ticketNumber).toMatch(/TKT-\d{6}/);
      expect(response.body.data.createTicket.status).toBe('OPEN');
      testTicketId = response.body.data.createTicket.id;
    });

    it('should reject ticket creation without auth', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              createTicket(createTicketInput: {
                title: "Unauthorized Ticket"
                description: "Should fail"
                priority: LOW
                category: OTHER
              }) {
                id
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.errors).toBeDefined();
    });

    it('should get ticket by id', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `
            query {
              ticket(id: "${testTicketId}") {
                id
                title
                status
                priority
                createdBy {
                  username
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.data.ticket.id).toBe(testTicketId);
      expect(response.body.data.ticket.title).toBe('E2E Test Ticket');
    });

    it('should update ticket as owner', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `
            mutation {
              updateTicket(
                id: "${testTicketId}"
                updateTicketInput: {
                  title: "Updated E2E Test Ticket"
                  priority: HIGH
                }
              ) {
                id
                title
                priority
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.data.updateTicket.title).toBe('Updated E2E Test Ticket');
      expect(response.body.data.updateTicket.priority).toBe('HIGH');
    });

    it('should get my tickets', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `
            query {
              myTickets {
                id
                title
              }
            }
          `,
        })
        .expect(200);

      expect(Array.isArray(response.body.data.myTickets)).toBe(true);
      expect(response.body.data.myTickets.length).toBeGreaterThan(0);
    });

    it('should allow admin to assign ticket', async () => {
      // First get a user to assign
      const usersResponse = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query: `
            query {
              agents {
                id
                username
              }
            }
          `,
        })
        .expect(200);

      const agents = usersResponse.body.data.agents;
      if (agents && agents.length > 0) {
        const response = await request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            query: `
              mutation {
                updateTicket(
                  id: "${testTicketId}"
                  updateTicketInput: {
                    assignedToId: "${agents[0].id}"
                  }
                ) {
                  id
                  assignedTo {
                    username
                  }
                }
              }
            `,
          })
          .expect(200);

        expect(response.body.data.updateTicket.assignedTo).toBeDefined();
      }
    });
  });

  describe('Comments', () => {
    it('should add a comment to ticket', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `
            mutation {
              createComment(createCommentInput: {
                ticketId: "${testTicketId}"
                content: "This is an e2e test comment"
                isInternal: false
              }) {
                id
                content
                user {
                  username
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.data.createComment.id).toBeDefined();
      expect(response.body.data.createComment.content).toBe('This is an e2e test comment');
    });

    it('should get comments for ticket', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `
            query {
              commentsByTicket(ticketId: "${testTicketId}") {
                id
                content
              }
            }
          `,
        })
        .expect(200);

      expect(Array.isArray(response.body.data.commentsByTicket)).toBe(true);
    });
  });

  describe('Dashboard', () => {
    it('should get ticket statistics', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query: `
            query {
              ticketStatistics {
                total
                open
                inProgress
                resolved
                closed
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.data.ticketStatistics.total).toBeDefined();
      expect(typeof response.body.data.ticketStatistics.total).toBe('number');
    });
  });
});
