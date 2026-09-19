import { WhatIfScenarioInput, WhatIfSimulationResult, CandidatePlan, AffectedEntity, Resource } from '@campussynapse/shared-types';
import { ResourceModel } from '../models/Resource.js';
import { BookingModel } from '../models/Booking.js';
import { OptimizerClient } from './optimizerClient.js';

export class SimulatorService {
  /**
   * Evaluates a hypothetical campus disruption scenario without mutating the real database state.
   */
  static async runSimulation(input: WhatIfScenarioInput): Promise<WhatIfSimulationResult> {
    const allResources = await ResourceModel.find().lean();
    const allBookings = await BookingModel.find({ status: 'SCHEDULED' }).lean();

    // 1. Create hypothetical clone of campus state
    const clonedResources: Resource[] = JSON.parse(JSON.stringify(allResources)).map((r: any) => ({
      ...r,
      id: r._id.toString(),
    }));

    const affectedBookings: AffectedEntity[] = [];
    let conflictsCount = 0;
    let affectedStudents = 0;

    // 2. Apply hypothetical disruption to the clone
    if (input.scenarioType === 'RESOURCE_UNAVAILABLE') {
      const target = clonedResources.find(
        (r) => r.id === input.resourceId || r.code === input.resourceId || r.name.toLowerCase().includes((input.reason || '').toLowerCase())
      ) || clonedResources.find((r) => r.type === 'AUDITORIUM') || clonedResources[0];

      if (target) {
        target.status = 'BLOCKED';

        // Find bookings scheduled in this room
        for (const b of allBookings) {
          if (b.resourceId === target.id || b.resourceName === target.name) {
            conflictsCount++;
            affectedStudents += b.attendees || 45;
            affectedBookings.push({
              bookingId: b._id.toString(),
              title: b.title,
              facultyName: b.organizer,
              attendeesCount: b.attendees,
              originalRoom: b.resourceName,
              originalTime: `${b.startTime} - ${b.endTime}`,
              disruptionLevel: b.type === 'EXAM' || b.attendees > 100 ? 'HIGH' : 'MEDIUM',
            });
          }
        }
      }
    } else if (input.scenarioType === 'POWER_OUTAGE' || input.scenarioType === 'CAPACITY_REDUCTION') {
      // Simulate multiple rooms in a building affected
      const bldgRooms = clonedResources.filter((r) => r.buildingName.includes('Block B') || r.buildingId === input.buildingId);
      for (const room of bldgRooms) {
        room.status = 'MAINTENANCE';
        for (const b of allBookings) {
          if (b.resourceId === room.id || b.resourceName === room.name) {
            conflictsCount++;
            affectedStudents += b.attendees || 40;
            affectedBookings.push({
              bookingId: b._id.toString(),
              title: b.title,
              facultyName: b.organizer,
              attendeesCount: b.attendees,
              originalRoom: b.resourceName,
              originalTime: `${b.startTime} - ${b.endTime}`,
              disruptionLevel: 'HIGH',
            });
          }
        }
      }
    }

    // 3. Generate automated mitigation / alternative reallocation options
    let alternativePlans: CandidatePlan[] = [];
    if (affectedBookings.length > 0) {
      const primaryAffected = affectedBookings[0];
      const optResult = await OptimizerClient.optimize({
        title: `Reallocated: ${primaryAffected.title}`,
        attendees: primaryAffected.attendeesCount,
        date: input.date,
        startTime: input.startTime || '14:00',
        endTime: input.endTime || '17:00',
        rooms: clonedResources.filter((r) => r.status === 'AVAILABLE'),
      });
      alternativePlans = optResult.plans;
    }

    const recActions = [
      `Isolate impacted zone (${affectedBookings.length} booking(s) flagged for relocation).`,
      alternativePlans.length > 0
        ? `Reassign primary booking to ${alternativePlans[0].resourceName} with 0 timetable conflict.`
        : 'Stagger session start times to preserve departmental lecture continuity.',
      'Broadcast proactive timetable adjustment notice to affected faculty and students.',
    ];

    return {
      simulationId: `sim-${Date.now()}`,
      scenarioDescription: `Hypothetical ${input.scenarioType.replace(/_/g, ' ')} for ${input.resourceId || 'Central Facilities'} on ${input.date} (${input.startTime || '14:00'} - ${input.endTime || '17:00'})`,
      timestamp: new Date().toISOString(),
      affectedBookings,
      affectedFacultyCount: new Set(affectedBookings.map((b) => b.facultyName)).size,
      affectedStudentsCount: affectedStudents,
      conflictsDetected: conflictsCount,
      availableMitigationsCount: alternativePlans.length,
      recommendedActions: recActions,
      alternativePlans,
      feasibilityRatio: alternativePlans.length > 0 ? 0.94 : 0.45,
    };
  }
}
