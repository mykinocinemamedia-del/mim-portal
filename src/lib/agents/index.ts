/**
 * Agent Registry Barrel File
 * --------------------------
 * Imports and registers ALL MIM Portal agents so that the agentRegistry
 * singleton is fully populated when this module is loaded.
 *
 * Usage:
 *   import { agentRegistry } from '@/lib/agents'
 *   const agent = agentRegistry.get('helper_recruiter')
 *   await agent.run({ trigger: 'manual' })
 */

import { agentRegistry } from './core/base-agent'

// Lead Generation agents
import { HelperRecruiterAgent } from './agents/helper-recruiter'
import { EmployerHunterAgent } from './agents/employer-hunter'
import { ReferralEngineAgent } from './agents/referral-engine'
import { ContentMarketerAgent } from './agents/content-marketer'

// Matching & Onboarding agents
import { MatchmakerAgent } from './agents/matchmaker'
import { OnboardingAgent } from './agents/onboarding'
import { InterviewCoordinatorAgent } from './agents/interview-coordinator'

// Operations & Support agents
import { ContractAgent } from './agents/contract-agent'
import { PaymentAgent } from './agents/payment-agent'
import { ScheduleAgent } from './agents/schedule-agent'
import { SupportAgent } from './agents/support-agent'
import { QualityMonitorAgent } from './agents/quality-monitor'

// Automation Phase 4-10
import { AutoScreenerAgent } from './agents/auto-screener'
import { SmartReplacementAgent } from './agents/smart-replacement'
import { PredictiveAnalyticsAgent } from './agents/predictive-analytics'

// Orchestrator
import { ChiefOfStaffAgent } from './agents/chief-of-staff'

// Register all agents (each agent file also self-registers on import,
// but we re-register here explicitly for clarity & to ensure order).
agentRegistry.register(new HelperRecruiterAgent())
agentRegistry.register(new EmployerHunterAgent())
agentRegistry.register(new ReferralEngineAgent())
agentRegistry.register(new ContentMarketerAgent())
agentRegistry.register(new MatchmakerAgent())
agentRegistry.register(new OnboardingAgent())
agentRegistry.register(new InterviewCoordinatorAgent())
agentRegistry.register(new ContractAgent())
agentRegistry.register(new PaymentAgent())
agentRegistry.register(new ScheduleAgent())
agentRegistry.register(new SupportAgent())
agentRegistry.register(new QualityMonitorAgent())
agentRegistry.register(new AutoScreenerAgent())
agentRegistry.register(new SmartReplacementAgent())
agentRegistry.register(new PredictiveAnalyticsAgent())
agentRegistry.register(new ChiefOfStaffAgent())

export { agentRegistry }
export type { BaseAgent, AgentContext, AgentRunResult } from './core/base-agent'
export { HelperRecruiterAgent } from './agents/helper-recruiter'
export { EmployerHunterAgent } from './agents/employer-hunter'
export { ReferralEngineAgent } from './agents/referral-engine'
export { ContentMarketerAgent } from './agents/content-marketer'
export { MatchmakerAgent } from './agents/matchmaker'
export { OnboardingAgent } from './agents/onboarding'
export { InterviewCoordinatorAgent } from './agents/interview-coordinator'
export { ContractAgent } from './agents/contract-agent'
export { PaymentAgent } from './agents/payment-agent'
export { ScheduleAgent } from './agents/schedule-agent'
export { SupportAgent } from './agents/support-agent'
export { QualityMonitorAgent } from './agents/quality-monitor'
export { ChiefOfStaffAgent } from './agents/chief-of-staff'
