import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1736700000000 implements MigrationInterface {
  name = 'InitialSchema1736700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "username" character varying NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "fullname" character varying NOT NULL,
        "roles" text NOT NULL DEFAULT 'USER',
        "phoneNumber" character varying,
        "workstationNumber" character varying,
        "isDisabled" boolean NOT NULL DEFAULT false,
        "slackUserId" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_username" UNIQUE ("username"),
        CONSTRAINT "UQ_user_email" UNIQUE ("email"),
        CONSTRAINT "PK_user" PRIMARY KEY ("id")
      )
    `);

    // Tickets table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ticket" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ticketNumber" character varying NOT NULL,
        "title" character varying NOT NULL,
        "description" text NOT NULL,
        "status" character varying NOT NULL DEFAULT 'OPEN',
        "priority" character varying NOT NULL DEFAULT 'MEDIUM',
        "category" character varying NOT NULL DEFAULT 'OTHER',
        "slackThreadTs" character varying,
        "createdById" uuid,
        "assignedToId" uuid,
        "resolvedAt" TIMESTAMP,
        "closedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_ticket_number" UNIQUE ("ticketNumber"),
        CONSTRAINT "PK_ticket" PRIMARY KEY ("id")
      )
    `);

    // Comments table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "comment" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "content" text NOT NULL,
        "isInternal" boolean NOT NULL DEFAULT false,
        "userId" uuid,
        "ticketId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_comment" PRIMARY KEY ("id")
      )
    `);

    // Attachments table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "attachment" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "filename" character varying NOT NULL,
        "filepath" character varying NOT NULL,
        "mimetype" character varying NOT NULL,
        "size" integer NOT NULL,
        "ticketId" uuid,
        "uploadedById" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_attachment" PRIMARY KEY ("id")
      )
    `);

    // Ticket watchers table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ticket_watcher" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ticketId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_ticket_watcher" UNIQUE ("ticketId", "userId"),
        CONSTRAINT "PK_ticket_watcher" PRIMARY KEY ("id")
      )
    `);

    // Knowledge articles table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "knowledge_article" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "content" text NOT NULL,
        "category" character varying NOT NULL,
        "tags" text,
        "isPublished" boolean NOT NULL DEFAULT false,
        "viewCount" integer NOT NULL DEFAULT 0,
        "authorId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_knowledge_article" PRIMARY KEY ("id")
      )
    `);

    // Survey responses table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "survey_response" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ticketId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "rating" integer NOT NULL,
        "feedback" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_survey_response" PRIMARY KEY ("id")
      )
    `);

    // Foreign keys for tickets
    await queryRunner.query(`
      ALTER TABLE "ticket" 
      ADD CONSTRAINT "FK_ticket_createdBy" 
      FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket" 
      ADD CONSTRAINT "FK_ticket_assignedTo" 
      FOREIGN KEY ("assignedToId") REFERENCES "user"("id") ON DELETE SET NULL
    `);

    // Foreign keys for comments
    await queryRunner.query(`
      ALTER TABLE "comment" 
      ADD CONSTRAINT "FK_comment_user" 
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "comment" 
      ADD CONSTRAINT "FK_comment_ticket" 
      FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE CASCADE
    `);

    // Foreign keys for attachments
    await queryRunner.query(`
      ALTER TABLE "attachment" 
      ADD CONSTRAINT "FK_attachment_ticket" 
      FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "attachment" 
      ADD CONSTRAINT "FK_attachment_uploadedBy" 
      FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE SET NULL
    `);

    // Foreign keys for ticket watchers
    await queryRunner.query(`
      ALTER TABLE "ticket_watcher" 
      ADD CONSTRAINT "FK_ticket_watcher_ticket" 
      FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "ticket_watcher" 
      ADD CONSTRAINT "FK_ticket_watcher_user" 
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
    `);

    // Foreign keys for knowledge articles
    await queryRunner.query(`
      ALTER TABLE "knowledge_article" 
      ADD CONSTRAINT "FK_knowledge_article_author" 
      FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL
    `);

    // Foreign keys for survey responses
    await queryRunner.query(`
      ALTER TABLE "survey_response" 
      ADD CONSTRAINT "FK_survey_response_ticket" 
      FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "survey_response" 
      ADD CONSTRAINT "FK_survey_response_user" 
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
    `);

    // Create indexes for performance
    await queryRunner.query(`CREATE INDEX "IDX_ticket_status" ON "ticket" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_ticket_priority" ON "ticket" ("priority")`);
    await queryRunner.query(`CREATE INDEX "IDX_ticket_createdById" ON "ticket" ("createdById")`);
    await queryRunner.query(`CREATE INDEX "IDX_ticket_assignedToId" ON "ticket" ("assignedToId")`);
    await queryRunner.query(`CREATE INDEX "IDX_comment_ticketId" ON "comment" ("ticketId")`);
    await queryRunner.query(`CREATE INDEX "IDX_attachment_ticketId" ON "attachment" ("ticketId")`);

    // Enable UUID extension if not exists
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.query(`ALTER TABLE "survey_response" DROP CONSTRAINT IF EXISTS "FK_survey_response_user"`);
    await queryRunner.query(`ALTER TABLE "survey_response" DROP CONSTRAINT IF EXISTS "FK_survey_response_ticket"`);
    await queryRunner.query(`ALTER TABLE "knowledge_article" DROP CONSTRAINT IF EXISTS "FK_knowledge_article_author"`);
    await queryRunner.query(`ALTER TABLE "ticket_watcher" DROP CONSTRAINT IF EXISTS "FK_ticket_watcher_user"`);
    await queryRunner.query(`ALTER TABLE "ticket_watcher" DROP CONSTRAINT IF EXISTS "FK_ticket_watcher_ticket"`);
    await queryRunner.query(`ALTER TABLE "attachment" DROP CONSTRAINT IF EXISTS "FK_attachment_uploadedBy"`);
    await queryRunner.query(`ALTER TABLE "attachment" DROP CONSTRAINT IF EXISTS "FK_attachment_ticket"`);
    await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT IF EXISTS "FK_comment_ticket"`);
    await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT IF EXISTS "FK_comment_user"`);
    await queryRunner.query(`ALTER TABLE "ticket" DROP CONSTRAINT IF EXISTS "FK_ticket_assignedTo"`);
    await queryRunner.query(`ALTER TABLE "ticket" DROP CONSTRAINT IF EXISTS "FK_ticket_createdBy"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_attachment_ticketId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_comment_ticketId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ticket_assignedToId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ticket_createdById"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ticket_priority"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ticket_status"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "survey_response"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "knowledge_article"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ticket_watcher"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "attachment"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "comment"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ticket"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user"`);
  }
}
