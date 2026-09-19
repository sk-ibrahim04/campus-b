import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { OrchestratorPage } from './pages/OrchestratorPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { SchedulesPage } from './pages/SchedulesPage';
import { RequestsPage } from './pages/RequestsPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="digital-twin" element={<DigitalTwinPage />} />
          <Route path="orchestrator" element={<OrchestratorPage />} />
          <Route path="simulator" element={<SimulatorPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="schedules" element={<SchedulesPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="approvals" element={<ApprovalsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="audit-log" element={<AuditLogPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
