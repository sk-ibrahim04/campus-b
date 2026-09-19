import { UserModel } from '../models/User.js';
import { BuildingModel } from '../models/Building.js';
import { ResourceModel } from '../models/Resource.js';
import { MaintenanceTicketModel } from '../models/MaintenanceTicket.js';
import { ApprovalModel } from '../models/Approval.js';
import { AuditLogModel } from '../models/AuditLog.js';
import { PolicyRuleModel, AutonomyConfigModel } from '../models/PolicyRule.js';
import { getSeedData } from './seedData.js';
import { connectDB } from '../config/db.js';

export async function resetAndSeedDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('[Seed] Clearing existing collections...');
    await UserModel.deleteMany({});
    await BuildingModel.deleteMany({});
    await ResourceModel.deleteMany({});
    await MaintenanceTicketModel.deleteMany({});
    await ApprovalModel.deleteMany({});
    await AuditLogModel.deleteMany({});
    await PolicyRuleModel.deleteMany({});
    await AutonomyConfigModel.deleteMany({});

    console.log('[Seed] Generating connected synthetic campus data...');
    const data = await getSeedData();

    await UserModel.insertMany(data.users);
    await BuildingModel.insertMany(data.buildings);
    await ResourceModel.insertMany(data.resources);
    await MaintenanceTicketModel.insertMany(data.maintenanceTickets);
    await ApprovalModel.insertMany(data.pendingApprovals);
    await AuditLogModel.insertMany(data.auditLogs);
    await PolicyRuleModel.insertMany(data.policyRules);
    await AutonomyConfigModel.create({ level: 2 });

    console.log('[Seed] CampusSynapse database seeded successfully.');
    return { success: true, message: 'CampusSynapse Digital Twin seeded with pristine demo dataset.' };
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
    throw err;
  }
}

// Standalone runner
if (process.argv[1]?.endsWith('seed/index.ts')) {
  (async () => {
    await connectDB();
    await resetAndSeedDatabase();
    process.exit(0);
  })();
}
