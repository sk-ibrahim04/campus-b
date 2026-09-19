import { ParsedIntent } from '@campussynapse/shared-types';

export function parseIntentDeterministic(prompt: string): ParsedIntent {
  const p = prompt.toLowerCase();

  // 1. Hero Query: "Plan a seminar for 180 students tomorrow from 2 PM to 5 PM"
  // or "Find a hall for 180 students tomorrow from 2 PM to 5 PM"
  if (p.includes('seminar') || p.includes('hall') || p.includes('plan an event') || p.includes('event for') || (p.includes('students') && p.includes('tomorrow'))) {
    // Extract capacity
    const capMatch = prompt.match(/(\d+)\s*(students|attendees|people|seats)/i);
    const capacity = capMatch ? parseInt(capMatch[1], 10) : 180;

    // Extract time
    let startTime = '14:00';
    let endTime = '17:00';
    const timeMatch = prompt.match(/(\d{1,2})\s*(?:pm|am)?\s*(?:to|-)\s*(\d{1,2})\s*(pm|am)/i);
    if (timeMatch) {
      let s = parseInt(timeMatch[1], 10);
      let e = parseInt(timeMatch[2], 10);
      const meridiem = timeMatch[3].toLowerCase();
      if (meridiem === 'pm') {
        if (s < 12) s += 12;
        if (e < 12) e += 12;
      }
      startTime = `${s.toString().padStart(2, '0')}:00`;
      endTime = `${e.toString().padStart(2, '0')}:00`;
    }

    // Tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    return {
      intent: 'RESOURCE_ALLOCATION',
      rawPrompt: prompt,
      resourceType: capacity > 100 ? 'SEMINAR_HALL' : 'CLASSROOM',
      capacity,
      date: dateStr,
      startTime,
      endTime,
      requirements: ['Projector', 'Audio System', 'Microphone', 'High-Speed Wi-Fi'],
      confidence: 0.98,
      agentResponsible: 'EventAgent',
    };
  }

  // 2. What-if Simulation: "What happens if Auditorium 1 becomes unavailable tomorrow?"
  if (p.includes('what if') || p.includes('what happens if') || p.includes('simulate') || p.includes('becomes unavailable')) {
    let targetRoom = 'Auditorium 1';
    if (p.includes('auditorium 2')) targetRoom = 'Auditorium 2';
    if (p.includes('lab c1')) targetRoom = 'Lab C1';
    if (p.includes('seminar hall a')) targetRoom = 'Seminar Hall A';

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      intent: 'SIMULATION',
      rawPrompt: prompt,
      targetRoom,
      date: tomorrow.toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '17:00',
      simulationScenario: 'RESOURCE_UNAVAILABLE',
      confidence: 0.96,
      agentResponsible: 'ScheduleAgent',
    };
  }

  // 3. Maintenance Query: "The projector in Room B204 is not working" or "electrical sparking"
  if (p.includes('not working') || p.includes('broken') || p.includes('sparking') || p.includes('leak') || p.includes('maintenance')) {
    return {
      intent: 'MAINTENANCE',
      rawPrompt: prompt,
      maintenanceIssue: prompt,
      confidence: 0.95,
      agentResponsible: 'MaintenanceAgent',
    };
  }

  // 4. Resource Recovery Query: "Find unused classrooms right now"
  if (p.includes('unused') || p.includes('empty') || p.includes('recover') || p.includes('ghost')) {
    return {
      intent: 'RESOURCE_RECOVERY',
      rawPrompt: prompt,
      confidence: 0.94,
      agentResponsible: 'ResourceAgent',
    };
  }

  // 5. Conflict Analysis: "Show conflicts for tomorrow afternoon"
  if (p.includes('conflict') || p.includes('clash') || p.includes('overlap')) {
    return {
      intent: 'CONFLICT_ANALYSIS',
      rawPrompt: prompt,
      date: new Date().toISOString().split('T')[0],
      confidence: 0.92,
      agentResponsible: 'ScheduleAgent',
    };
  }

  // 6. Generic resource search fallback
  return {
    intent: 'RESOURCE_SEARCH',
    rawPrompt: prompt,
    capacity: 50,
    startTime: '10:00',
    endTime: '12:00',
    date: new Date().toISOString().split('T')[0],
    confidence: 0.85,
    agentResponsible: 'ResourceAgent',
  };
}

export function classifyMaintenanceDeterministic(description: string): {
  category: 'EQUIPMENT' | 'ELECTRICAL' | 'HVAC' | 'PLUMBING' | 'STRUCTURAL';
  subcategory: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedTeam: string;
  immediateAction: string;
} {
  const d = description.toLowerCase();

  if (d.includes('spark') || d.includes('fire') || d.includes('smoke') || d.includes('short circuit') || d.includes('shock')) {
    return {
      category: 'ELECTRICAL',
      subcategory: 'High Voltage Hazard',
      priority: 'CRITICAL',
      assignedTeam: 'Emergency Electrical Response Team',
      immediateAction: 'Resource automatically BLOCKED. Power grid isolation dispatched. Security notified.',
    };
  }

  if (d.includes('ac') || d.includes('air condition') || d.includes('heating') || d.includes('ventilation') || d.includes('too hot')) {
    return {
      category: 'HVAC',
      subcategory: 'Climate Control',
      priority: 'MEDIUM',
      assignedTeam: 'HVAC Maintenance Dept',
      immediateAction: 'Diagnostic ticket queued for scheduled technician dispatch.',
    };
  }

  if (d.includes('leak') || d.includes('water') || d.includes('pipe') || d.includes('flood')) {
    return {
      category: 'PLUMBING',
      subcategory: 'Water Line Leak',
      priority: d.includes('flood') ? 'CRITICAL' : 'HIGH',
      assignedTeam: 'Plumbing Services',
      immediateAction: 'Valve shutdown team alerted.',
    };
  }

  if (d.includes('projector') || d.includes('mic') || d.includes('screen') || d.includes('display') || d.includes('speaker') || d.includes('audio')) {
    return {
      category: 'EQUIPMENT',
      subcategory: 'AV Hardware Failure',
      priority: 'MEDIUM',
      assignedTeam: 'IT / AV Support Services',
      immediateAction: 'Spare equipment requisition and field technician assigned.',
    };
  }

  return {
    category: 'EQUIPMENT',
    subcategory: 'General Facilities',
    priority: 'LOW',
    assignedTeam: 'General Maintenance Crew',
    immediateAction: 'Ticket logged in regular maintenance queue.',
  };
}
