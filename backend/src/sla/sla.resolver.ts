import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { SlaService } from "./sla.service";
import { AutoAssignmentService } from "./auto-assignment.service";
import { SlaPolicy } from "./entities/sla-policy.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "../common/enums/role.enum";
import { ObjectType, Field, Int } from "@nestjs/graphql";

@ObjectType()
class SlaStats {
  @Field(() => Int)
  totalTickets: number;

  @Field(() => Int)
  breachedTickets: number;

  @Field(() => Int)
  escalatedTickets: number;

  @Field(() => Int)
  averageResolutionMinutes: number;
}

@ObjectType()
class AgentWorkloadStats {
  @Field()
  agentId: string;

  @Field()
  agentName: string;

  @Field(() => Int)
  openTickets: number;

  @Field(() => Int)
  inProgressTickets: number;

  @Field(() => Int)
  totalActive: number;
}

@ObjectType()
class RebalanceResult {
  @Field(() => Int)
  reassigned: number;
}

@Resolver(() => SlaPolicy)
@UseGuards(JwtAuthGuard, RolesGuard)
export class SlaResolver {
  constructor(
    private readonly slaService: SlaService,
    private readonly autoAssignmentService: AutoAssignmentService,
  ) {}

  @Query(() => [SlaPolicy], { name: "slaPolicies" })
  @Roles(Role.ADMIN, Role.AGENT)
  async findAllPolicies(): Promise<SlaPolicy[]> {
    return this.slaService.findAllPolicies();
  }

  @Query(() => SlaStats, { name: "slaStatistics" })
  @Roles(Role.ADMIN, Role.AGENT)
  async getSlaStats(): Promise<SlaStats> {
    return this.slaService.getSlaStats();
  }

  @Query(() => [AgentWorkloadStats], { name: "agentWorkload" })
  @Roles(Role.ADMIN)
  async getAgentWorkload(): Promise<AgentWorkloadStats[]> {
    const workloads = await this.autoAssignmentService.getAgentWorkloadStats();
    return workloads.map(w => ({
      agentId: w.agent.id,
      agentName: w.agent.fullname,
      openTickets: w.openTickets,
      inProgressTickets: w.inProgressTickets,
      totalActive: w.totalActive,
    }));
  }

  @Mutation(() => RebalanceResult)
  @Roles(Role.ADMIN)
  async rebalanceTickets(): Promise<RebalanceResult> {
    return this.autoAssignmentService.rebalanceTickets();
  }
}
