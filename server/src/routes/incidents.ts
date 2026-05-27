import { Router } from 'express';
import { IncidentLog, SimulateRequest } from '../types';

const router = Router();

// In-memory incident logs
let incidentLogs: IncidentLog[] = [
  { timestamp: '19:42', message: 'System startup complete', severity: 'info', location: 'Control Room' },
  { timestamp: '19:43', message: 'All projectors online and operational', severity: 'info', location: 'Zone A, Zone B' },
  { timestamp: '19:44', message: 'Network Rack NR-1 status normal', severity: 'info', location: 'Network Room' },
  { timestamp: '19:45', message: 'Electrical systems nominal', severity: 'info', location: 'Electrical Room' },
  { timestamp: '19:46', message: 'Crowd flow normal at all gates', severity: 'info', location: 'Gates 1-3' }
];

router.get('/', (req, res) => {
  res.json({ logs: incidentLogs });
});

router.post('/simulate', (req, res) => {
  const { scenario } = req.body as SimulateRequest;
  const now = new Date();
  const timestamp = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

  let newLogs: IncidentLog[] = [];
  let highlightedLocations: string[] = [];
  let safetyWarning: string | undefined;

  switch (scenario) {
    case 'projector_failure':
      newLogs = [
        { timestamp, message: 'Projector B power indicator OFF', severity: 'critical', location: 'Zone B' },
        { timestamp, message: 'AV Controller AC-2 shows no output signal', severity: 'warning', location: 'AV Booth' },
        { timestamp, message: 'Checking Electrical Panel EP-2 status', severity: 'info', location: 'Electrical Room' }
      ];
      highlightedLocations = ['Zone B', 'AV Booth', 'Electrical Room'];
      break;

    case 'network_rack_alert':
      newLogs = [
        { timestamp, message: 'Network Rack NR-1 temperature elevated', severity: 'warning', location: 'Network Room' },
        { timestamp, message: 'Switch port 12 packet loss detected', severity: 'warning', location: 'Network Room' },
        { timestamp, message: 'AV system connectivity intermittent', severity: 'warning', location: 'AV Booth' }
      ];
      highlightedLocations = ['Network Room', 'AV Booth'];
      break;

    case 'smoke_detector_alert':
      newLogs = [
        { timestamp, message: 'SMOKE DETECTOR SD-G3 TRIGGERED', severity: 'critical', location: 'Gate 3 Corridor' },
        { timestamp, message: 'Visual inspection required immediately', severity: 'critical', location: 'Gate 3 Corridor' },
        { timestamp, message: 'Security notified - standby for evacuation', severity: 'critical', location: 'Security Desk' }
      ];
      highlightedLocations = ['Gate 3 Corridor', 'Security Desk', 'First Aid'];
      safetyWarning = 'SAFETY ALERT: Do not silence alarms. Verify area safety and escalate to fire/safety personnel.';
      break;
  }

  incidentLogs = [...incidentLogs, ...newLogs];

  res.json({
    logs: incidentLogs,
    highlightedLocations,
    safetyWarning
  });
});

router.post('/reset', (req, res) => {
  incidentLogs = [
    { timestamp: '19:42', message: 'System startup complete', severity: 'info', location: 'Control Room' },
    { timestamp: '19:43', message: 'All projectors online and operational', severity: 'info', location: 'Zone A, Zone B' },
    { timestamp: '19:44', message: 'Network Rack NR-1 status normal', severity: 'info', location: 'Network Room' },
    { timestamp: '19:45', message: 'Electrical systems nominal', severity: 'info', location: 'Electrical Room' },
    { timestamp: '19:46', message: 'Crowd flow normal at all gates', severity: 'info', location: 'Gates 1-3' }
  ];
  res.json({ logs: incidentLogs });
});

export { router as incidentsRouter };
