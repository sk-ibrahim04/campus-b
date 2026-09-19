import { EventEmitter } from 'events';
import { broadcastEvent } from './socket.js';
import { AuditLogModel } from '../models/AuditLog.js';
import { NotificationModel } from '../models/Notification.js';

export const eventBus = new EventEmitter();

export interface CampusEvent {
  type: string;
  actor: string;
  agent?: string;
  action: string;
  reason: string;
  affectedResources: string[];
  previousState?: string;
  newState?: string;
  approvalRequired?: boolean;
  metadata?: Record<string, unknown>;
}

// Global listener to record audit logs and broadcast live updates
eventBus.on('campus_event', async (evt: CampusEvent) => {
  try {
    // 1. Persist in Audit Log
    const auditEntry = await AuditLogModel.create({
      actor: evt.actor || 'System',
      agent: evt.agent || 'CampusSynapse Engine',
      action: evt.action,
      reason: evt.reason,
      affectedResources: evt.affectedResources || [],
      previousState: evt.previousState,
      newState: evt.newState,
      approvalRequired: !!evt.approvalRequired,
      metadata: evt.metadata,
    });

    // 2. Broadcast via Socket.IO
    broadcastEvent('audit_logged', auditEntry);
    broadcastEvent('digital_twin_updated', {
      eventType: evt.type,
      affectedResources: evt.affectedResources,
      newState: evt.newState,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[EventBus] Error processing event:', err);
  }
});

export async function emitCampusEvent(evt: CampusEvent): Promise<void> {
  eventBus.emit('campus_event', evt);
}

export async function createAndBroadcastNotification(
  title: string,
  message: string,
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL' = 'INFO',
  recipientRole?: string
): Promise<void> {
  try {
    const notif = await NotificationModel.create({
      title,
      message,
      type,
      recipientRole,
    });
    broadcastEvent('notification_created', notif);
  } catch (err) {
    console.error('[EventBus] Error creating notification:', err);
  }
}
