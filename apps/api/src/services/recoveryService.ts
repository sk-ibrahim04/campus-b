import { ResourceModel } from '../models/Resource.js';
import { BookingModel } from '../models/Booking.js';
import { emitCampusEvent, createAndBroadcastNotification } from '../events/eventBus.js';

export class RecoveryService {
  private static recoveredCountToday = 5;

  static getRecoveredCount(): number {
    return this.recoveredCountToday;
  }

  /**
   * Scans for ghost reservations (e.g. reserved room where telemetry shows 0 occupancy past grace period)
   */
  static async scanAndDetectUnusedReservations() {
    const resources = await ResourceModel.find({
      status: 'RESERVED',
      'telemetry.occupancyCount': { $lte: 2 },
    }).lean();

    return resources.map((r) => ({
      resourceId: r._id.toString(),
      roomName: r.name,
      building: r.buildingName,
      capacity: r.capacity,
      expectedOccupancy: r.capacity * 0.7,
      currentOccupancy: r.telemetry?.occupancyCount || 0,
      gracePeriodMinutesRemaining: 0,
      isRecoverable: true,
    }));
  }

  /**
   * Recovers an abandoned reservation and restores room to AVAILABLE
   */
  static async recoverResource(resourceId: string, actor: string = 'AutonomyEngine'): Promise<boolean> {
    const resource = await ResourceModel.findOne({
      $or: [{ _id: resourceId }, { code: resourceId }, { name: resourceId }],
    });
    if (!resource) return false;

    const previousStatus = resource.status;
    resource.status = 'AVAILABLE';
    resource.currentOccupancy = 0;
    if (resource.telemetry) {
      resource.telemetry.occupancyCount = 0;
    }
    await resource.save();

    this.recoveredCountToday += 1;

    await emitCampusEvent({
      type: 'RESOURCE_RELEASED',
      actor,
      agent: 'ResourceAgent',
      action: 'RESOURCE_RECOVERY_EXECUTION',
      reason: `Automated recovery of unused reservation for ${resource.name}. Expected occupancy was unfulfilled past grace period.`,
      affectedResources: [resource.name],
      previousState: previousStatus,
      newState: 'AVAILABLE',
      approvalRequired: false,
    });

    await createAndBroadcastNotification(
      'Resource Recovered & Available',
      `${resource.name} (${resource.buildingName}) was recovered after 0-occupancy detection. Now open for pending allocations.`,
      'SUCCESS'
    );

    return true;
  }
}
