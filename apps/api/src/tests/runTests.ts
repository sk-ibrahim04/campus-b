import { connectDB, disconnectDB } from '../config/db.js';
import { resetAndSeedDatabase } from '../seed/index.js';
import { ResourceModel } from '../models/Resource.js';
import { PolicyEngine } from '../policies/policyEngine.js';
import { SimulatorService } from '../services/simulatorService.js';
import { OptimizerClient } from '../services/optimizerClient.js';
import { doIntervalsOverlap } from '@campussynapse/shared-utils';

async function runTests() {
  console.log('--- STARTING CAMPUSSYNAPSE AUTOMATED VERIFICATION ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    await connectDB();
    await resetAndSeedDatabase();

    // Test 1: Seed data integrity
    const resourcesCount = await ResourceModel.countDocuments();
    assert(resourcesCount >= 10, `Database seeded with ${resourcesCount} resources`);

    // Test 2: Interval overlap utility
    const overlap1 = doIntervalsOverlap('14:00', '16:00', '15:00', '17:00');
    assert(overlap1 === true, 'Interval overlap detected for overlapping slots (14-16 & 15-17)');

    const overlap2 = doIntervalsOverlap('10:00', '12:00', '14:00', '16:00');
    assert(overlap2 === false, 'Interval overlap correctly reports false for disjoint slots (10-12 & 14-16)');

    // Test 3: Policy Engine capacity gate
    const dummyPlan: any = {
      planId: 'test-1',
      title: 'Plan Test',
      resourceName: 'Room Test',
      capacity: 60,
    };
    const dummyResource: any = {
      name: 'Small Classroom',
      capacity: 50,
      status: 'AVAILABLE',
    };
    const policyCheck = PolicyEngine.validatePlan(dummyPlan, dummyResource, 80);
    assert(policyCheck.isValid === false, 'Policy engine rejects over-capacity allocation (80 attendees in 50 seat room)');

    // Test 4: Optimizer Client candidate plan generation
    const allResources = await ResourceModel.find().lean();
    const optResult = await OptimizerClient.optimize({
      title: 'Test Seminar',
      attendees: 180,
      date: '2026-09-20',
      startTime: '14:00',
      endTime: '17:00',
      rooms: allResources as any,
    });
    assert(optResult.plans.length >= 1, `Optimizer generated ${optResult.plans.length} candidate plans using ${optResult.solverEngine}`);
    assert(optResult.plans[0].capacity >= 180, 'Top recommended plan satisfies capacity requirement');

    // Test 5: What-If simulation safety (zero real mutation)
    const initialAvailableCount = await ResourceModel.countDocuments({ status: 'AVAILABLE' });
    const simResult = await SimulatorService.runSimulation({
      scenarioType: 'RESOURCE_UNAVAILABLE',
      date: '2026-09-20',
      startTime: '14:00',
      endTime: '17:00',
      reason: 'Auditorium maintenance',
    });
    const postSimAvailableCount = await ResourceModel.countDocuments({ status: 'AVAILABLE' });
    assert(initialAvailableCount === postSimAvailableCount, 'Simulation executed without mutating persistent database state');
    assert(simResult.simulationId.startsWith('sim-'), 'Simulation generated valid telemetry summary');

    console.log(`\nTEST SUMMARY: ${passed} passed, ${failed} failed.`);
    await disconnectDB();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test run failed with unhandled exception:', err);
    await disconnectDB();
    process.exit(1);
  }
}

runTests();
