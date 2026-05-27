import OpenAI from 'openai';
import { AgentAskRequest, AgentResponse } from '../types';
import { sessions } from '../routes/session';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!process.env.MODEL_API_KEY) {
    return null;
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.MODEL_API_KEY
    });
  }
  return openaiClient;
}

const SYSTEM_PROMPT = `You are AngelMC, a mission-control assistant for venue engineers during live events.

Your role:
- Answer questions based on the venue context and incident logs provided
- Help engineers locate equipment, breakers, and network infrastructure
- Provide safe troubleshooting steps when issues are reported
- Give status summaries when asked
- Always prioritize safety over speed
- Never tell users to bypass, silence, or disable safety equipment
- For fire, smoke, electrical hazards, or visible damage: immediately escalate to safety staff

IMPORTANT: Base your responses on the ACTUAL incident logs and context provided. If asked for a status report, summarize what the logs show. If asked about specific equipment, reference only that equipment. Do not make up issues that aren't in the logs.

Response format (JSON):
{
  "situation": "Brief description based on the actual logs/question - be specific to what was asked",
  "relevantLocation": "Location(s) relevant to the query",
  "blueprintPath": "Equipment chain if troubleshooting, or 'N/A' for status queries",
  "nextSafeChecks": ["Actionable step 1", "Step 2", "Step 3"],
  "escalationRule": "When to escalate (or 'None currently' if all normal)",
  "suggestedSpokenInstruction": "One concise sentence directly answering the question",
  "highlightedLocations": ["Location1", "Location2"],
  "relevantAssets": ["Only assets relevant to this specific query"],
  "safetyWarning": "Only if there's an actual safety concern in the logs"
}

Keep spoken instructions under 30 words. Be direct and specific to what was asked.`;

export async function askAgent(request: AgentAskRequest): Promise<AgentResponse> {
  console.log('--- Agent Request ---');
  console.log('Transcript:', request.transcript);
  console.log('SessionId:', request.sessionId);

  const openai = getOpenAIClient();

  if (!openai) {
    console.warn('No MODEL_API_KEY configured, using fallback response');
    return getFallbackResponse(request.transcript);
  }

  const session = sessions.get(request.sessionId);
  const contextContent = session?.contextContent || '';
  console.log('Session found:', !!session);
  console.log('Context length:', contextContent.length);

  const incidentContext = request.incidentLogs
    .map(log => `[${log.timestamp}] ${log.message}`)
    .join('\n');

  const userMessage = `
VENUE CONTEXT:
${contextContent}

RECENT INCIDENT LOGS:
${incidentContext}

ENGINEER'S QUESTION:
${request.transcript}

Respond with JSON only.`;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.MODEL_NAME || 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from model');
    }

    const response = JSON.parse(content) as AgentResponse;
    console.log('Model response:', response.suggestedSpokenInstruction);

    // Apply safety guardrails
    return applySafetyGuardrails(response, request.transcript);
  } catch (error) {
    console.error('Agent error:', error);
    console.log('Using fallback due to error');
    return getFallbackResponse(request.transcript);
  }
}

function applySafetyGuardrails(response: AgentResponse, transcript: string): AgentResponse {
  const lowerTranscript = transcript.toLowerCase();
  const dangerKeywords = ['smoke', 'fire', 'burning', 'alarm', 'spark', 'damage'];

  if (dangerKeywords.some(keyword => lowerTranscript.includes(keyword))) {
    response.safetyWarning = 'SAFETY ALERT: Do not attempt to resolve this yourself. Evacuate the area if necessary and contact authorized safety personnel immediately.';
    response.escalationRule = 'IMMEDIATE: Contact fire/safety staff. Do not silence alarms or attempt repairs.';
  }

  return response;
}

function getFallbackResponse(transcript: string): AgentResponse {
  // Smart fallback based on keywords in the transcript
  const lower = transcript.toLowerCase();

  if (lower.includes('projector') && lower.includes('breaker')) {
    return {
      situation: 'Projector power issue reported',
      relevantLocation: 'Zone B, AV Booth, Electrical Room',
      blueprintPath: 'Projector B -> AV Controller AC-2 -> Electrical Panel EP-2 -> Breaker 14',
      nextSafeChecks: [
        'Check AV Controller AC-2 in the AV Booth for power and status lights',
        'Verify HDMI input is active on the controller',
        'If authorized, inspect Electrical Panel EP-2 breaker 14 in the Electrical Room'
      ],
      escalationRule: 'If there is visible damage, smoke, or burning smell, stop and escalate to safety staff',
      suggestedSpokenInstruction: 'Go to the AV Booth first and check AC-2. If the controller is normal, inspect breaker 14 in the Electrical Room if authorized.',
      highlightedLocations: ['Zone B', 'AV Booth', 'Electrical Room'],
      relevantAssets: ['Projector B', 'AV Controller AC-2', 'Electrical Panel EP-2']
    };
  }

  if (lower.includes('smoke') || lower.includes('fire') || lower.includes('alarm')) {
    return {
      situation: 'Safety alert reported',
      relevantLocation: 'Gate 3 Corridor, Security Desk',
      blueprintPath: 'Smoke Detector SD-G3 -> Fire Alarm Panel -> Security Desk',
      nextSafeChecks: [
        'Do NOT silence or bypass alarms',
        'Alert Security Desk immediately',
        'Verify area safety from a safe distance'
      ],
      escalationRule: 'IMMEDIATE: Contact fire/safety staff. Do not attempt repairs.',
      suggestedSpokenInstruction: 'Do not silence the alarm. Alert Security immediately and verify the area is safe from a distance.',
      highlightedLocations: ['Gate 3 Corridor', 'Security Desk', 'First Aid'],
      relevantAssets: ['Smoke Detector SD-G3'],
      safetyWarning: 'SAFETY ALERT: Do not attempt to resolve this yourself. Contact authorized safety personnel immediately.'
    };
  }

  if (lower.includes('network') || lower.includes('rack')) {
    return {
      situation: 'Network equipment issue reported',
      relevantLocation: 'Network Room',
      blueprintPath: 'Network Rack NR-1 -> AV System -> Ticket Scanners',
      nextSafeChecks: [
        'Check Network Rack NR-1 status lights in the Network Room',
        'Verify cooling fans are operating',
        'Check for red or amber indicators on switches'
      ],
      escalationRule: 'If multiple systems affected or overheating detected, contact IT immediately',
      suggestedSpokenInstruction: 'Go to the Network Room and check the status lights on Network Rack NR-1. Look for any red or amber indicators.',
      highlightedLocations: ['Network Room', 'AV Booth'],
      relevantAssets: ['Network Rack NR-1']
    };
  }

  return {
    situation: 'Unable to process request fully',
    relevantLocation: 'Unknown',
    blueprintPath: 'Check venue documentation',
    nextSafeChecks: [
      'Verify your location',
      'Check for visible issues',
      'Contact control room if needed'
    ],
    escalationRule: 'If unsure, contact the control room',
    suggestedSpokenInstruction: 'I could not fully process your request. Please check with the control room for guidance.',
    highlightedLocations: [],
    relevantAssets: []
  };
}
