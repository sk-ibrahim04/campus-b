import { AutonomyLevel } from '@campussynapse/shared-types';
import { AutonomyConfigModel } from '../models/PolicyRule.js';

export class AutonomyEngine {
  private static currentLevel: AutonomyLevel = 2; // Level 2: Approve then Execute by default
  private static autoActionsCountToday: number = 12;

  static async getLevel(): Promise<AutonomyLevel> {
    const config = await AutonomyConfigModel.findOne();
    if (config) {
      this.currentLevel = config.level as AutonomyLevel;
    }
    return this.currentLevel;
  }

  static async setLevel(level: AutonomyLevel): Promise<AutonomyLevel> {
    this.currentLevel = level;
    await AutonomyConfigModel.findOneAndUpdate(
      {},
      { level, updatedAt: new Date() },
      { upsert: true }
    );
    return this.currentLevel;
  }

  static getAutonomousActionsCount(): number {
    return this.autoActionsCountToday;
  }

  static incrementAutoActions(): void {
    this.autoActionsCountToday += 1;
  }

  /**
   * Evaluates whether an action can be safely auto-executed under the current autonomy level
   */
  static async canAutoExecute(actionType: string, isHighImpact: boolean): Promise<boolean> {
    const lvl = await this.getLevel();

    // Level 0 & 1 never auto-execute
    if (lvl <= 1) return false;

    // High impact (e.g. high capacity event, exam shift, major hall booking) always requires approval
    if (isHighImpact) return false;

    // Level 3 allows safe low-risk autonomous execution
    if (lvl === 3) {
      const safeActions = [
        'RELEASE_EXPIRED_RESERVATION',
        'CATEGORIZE_TICKET',
        'NOTIFY_CONFLICT',
        'GENERATE_REPORT',
        'RECOVER_UNUSED_RESOURCE',
      ];
      return safeActions.includes(actionType);
    }

    return false;
  }
}
