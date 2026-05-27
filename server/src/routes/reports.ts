import { Router } from 'express';
import { IncidentLog, AgentResponse } from '../types';

const router = Router();

interface ReportRequest {
  eventMode: string;
  transcript: string;
  agentResponse: AgentResponse;
  incidentLogs: IncidentLog[];
}

router.post('/', (req, res) => {
  const { eventMode, transcript, agentResponse, incidentLogs } = req.body as ReportRequest;

  const timestamp = new Date().toISOString();
  const recentLogs = incidentLogs.slice(-5);

  const report = `
================================================================================
                        INCIDENT REPORT - AngelMC
================================================================================

Generated: ${timestamp}
Event Mode: ${eventMode || 'Live Event Mode'}

--------------------------------------------------------------------------------
OPERATOR QUERY
--------------------------------------------------------------------------------
"${transcript}"

--------------------------------------------------------------------------------
SITUATION ASSESSMENT
--------------------------------------------------------------------------------
${agentResponse.situation}

Relevant Location: ${agentResponse.relevantLocation}
Blueprint Path: ${agentResponse.blueprintPath}

--------------------------------------------------------------------------------
RECOMMENDED ACTIONS
--------------------------------------------------------------------------------
${agentResponse.nextSafeChecks.map((check, i) => `${i + 1}. ${check}`).join('\n')}

--------------------------------------------------------------------------------
ESCALATION RULE
--------------------------------------------------------------------------------
${agentResponse.escalationRule}

--------------------------------------------------------------------------------
RELEVANT ASSETS
--------------------------------------------------------------------------------
${agentResponse.relevantAssets.length > 0 ? agentResponse.relevantAssets.join(', ') : 'None specified'}

--------------------------------------------------------------------------------
RECENT INCIDENT LOGS
--------------------------------------------------------------------------------
${recentLogs.map(log => `[${log.timestamp}] ${log.message}`).join('\n')}

${agentResponse.safetyWarning ? `
--------------------------------------------------------------------------------
SAFETY WARNING
--------------------------------------------------------------------------------
${agentResponse.safetyWarning}
` : ''}
================================================================================
                              END OF REPORT
================================================================================
`.trim();

  res.json({ report });
});

export { router as reportsRouter };
