import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSlaPolicies1736700001000 implements MigrationInterface {
  name = "AddSlaPolicies1736700001000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // SLA Policies table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "sla_policy" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "priority" character varying NOT NULL,
        "responseTimeMinutes" integer NOT NULL,
        "resolutionTimeMinutes" integer NOT NULL,
        "escalationEnabled" boolean NOT NULL DEFAULT true,
        "escalationAfterMinutes" integer,
        "escalationToUserId" uuid,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sla_policy" PRIMARY KEY ("id")
      )
    `);

    // Add SLA tracking columns to tickets
    await queryRunner.query(`
      ALTER TABLE "ticket" 
      ADD COLUMN IF NOT EXISTS "slaPolicyId" uuid,
      ADD COLUMN IF NOT EXISTS "slaResponseDueAt" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "slaResolutionDueAt" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "slaResponseMetAt" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "slaBreached" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "escalatedAt" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "escalatedToId" uuid
    `);

    // Foreign key for SLA policy
    await queryRunner.query(`
      ALTER TABLE "ticket" 
      ADD CONSTRAINT "FK_ticket_slaPolicy" 
      FOREIGN KEY ("slaPolicyId") REFERENCES "sla_policy"("id") ON DELETE SET NULL
    `);

    // Foreign key for escalation
    await queryRunner.query(`
      ALTER TABLE "ticket" 
      ADD CONSTRAINT "FK_ticket_escalatedTo" 
      FOREIGN KEY ("escalatedToId") REFERENCES "user"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "sla_policy" 
      ADD CONSTRAINT "FK_sla_policy_escalationTo" 
      FOREIGN KEY ("escalationToUserId") REFERENCES "user"("id") ON DELETE SET NULL
    `);

    // Create index for SLA queries
    await queryRunner.query(`CREATE INDEX "IDX_ticket_slaBreached" ON "ticket" ("slaBreached")`);
    await queryRunner.query(`CREATE INDEX "IDX_ticket_slaResolutionDueAt" ON "ticket" ("slaResolutionDueAt")`);

    // Insert default SLA policies
    await queryRunner.query(`
      INSERT INTO "sla_policy" ("name", "description", "priority", "responseTimeMinutes", "resolutionTimeMinutes", "escalationAfterMinutes")
      VALUES 
        ('Critical SLA', 'For critical priority tickets', 'CRITICAL', 15, 120, 60),
        ('High SLA', 'For high priority tickets', 'HIGH', 60, 480, 240),
        ('Medium SLA', 'For medium priority tickets', 'MEDIUM', 240, 1440, 720),
        ('Low SLA', 'For low priority tickets', 'LOW', 480, 2880, 1440)
      ON CONFLICT DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ticket_slaResolutionDueAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ticket_slaBreached"`);

    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE "sla_policy" DROP CONSTRAINT IF EXISTS "FK_sla_policy_escalationTo"`);
    await queryRunner.query(`ALTER TABLE "ticket" DROP CONSTRAINT IF EXISTS "FK_ticket_escalatedTo"`);
    await queryRunner.query(`ALTER TABLE "ticket" DROP CONSTRAINT IF EXISTS "FK_ticket_slaPolicy"`);

    // Remove SLA columns from tickets
    await queryRunner.query(`
      ALTER TABLE "ticket" 
      DROP COLUMN IF EXISTS "escalatedToId",
      DROP COLUMN IF EXISTS "escalatedAt",
      DROP COLUMN IF EXISTS "slaBreached",
      DROP COLUMN IF EXISTS "slaResponseMetAt",
      DROP COLUMN IF EXISTS "slaResolutionDueAt",
      DROP COLUMN IF EXISTS "slaResponseDueAt",
      DROP COLUMN IF EXISTS "slaPolicyId"
    `);

    // Drop SLA policies table
    await queryRunner.query(`DROP TABLE IF EXISTS "sla_policy"`);
  }
}
