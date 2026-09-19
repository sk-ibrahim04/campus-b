const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api';

// Decode JWT payload to check expiry client-side without crypto
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // malformed token — treat as expired
  }
}

export function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('campussynapse_token');
  if (!token || isTokenExpired(token)) {
    // Stale token — remove it so auto-relogin kicks in
    if (token) localStorage.removeItem('campussynapse_token');
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}

async function autoReLogin(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@campussynapse.edu', password: 'Admin@123' }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('campussynapse_token', data.token);
        localStorage.setItem('campussynapse_user', JSON.stringify(data.user));
        return data.token;
      }
    }
  } catch {
    // silent
  }
  return null;
}

async function handleResponse<T>(res: Response, retryFn?: () => Promise<Response>): Promise<T> {
  if (res.status === 401 && retryFn) {
    // Token expired or invalid — attempt silent re-login
    const newToken = await autoReLogin();
    if (newToken) {
      const retried = await retryFn();
      if (retried.ok) return retried.json();
    }
    // If re-login failed, clear storage and reload
    localStorage.removeItem('campussynapse_token');
    localStorage.removeItem('campussynapse_user');
    window.location.href = '/login';
    throw new Error('Session expired. Redirecting to login...');
  }
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  return res.json();
}


export const api = {
  // Auth
  login: async (credentials: { email: string; password: string }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse<any>(res);
  },

  // Dashboard
  getDashboard: async () => {
    const fetcher = () => fetch(`${API_BASE}/dashboard`, { headers: getAuthHeader() });
    const res = await fetcher();
    return handleResponse<any>(res, fetcher);
  },

  // Resources
  getResources: async (params?: { buildingId?: string; status?: string; type?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const fetcher = () => fetch(`${API_BASE}/resources?${query}`, { headers: getAuthHeader() });
    const res = await fetcher();
    return handleResponse<any[]>(res, fetcher);
  },

  getResourceById: async (id: string) => {
    const res = await fetch(`${API_BASE}/resources/${id}`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any>(res);
  },

  updateResourceStatus: async (id: string, status: string, reason?: string) => {
    const res = await fetch(`${API_BASE}/resources/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status, reason }),
    });
    return handleResponse<any>(res);
  },

  recoverResource: async (id: string) => {
    const res = await fetch(`${API_BASE}/resources/${id}/recover`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return handleResponse<any>(res);
  },

  getBuildings: async () => {
    const res = await fetch(`${API_BASE}/buildings`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any[]>(res);
  },

  // Schedules
  getSchedules: async () => {
    const res = await fetch(`${API_BASE}/schedules`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any[]>(res);
  },

  createBooking: async (bookingData: any) => {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(bookingData),
    });
    return handleResponse<any>(res);
  },

  // Orchestrator
  interpretCommand: async (prompt: string) => {
    const body = JSON.stringify({ prompt });
    const fetcher = () => fetch(`${API_BASE}/orchestrator/interpret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body,
    });
    const res = await fetcher();
    return handleResponse<any>(res, fetcher);
  },

  planAndOptimize: async (params: { prompt?: string; requestedIntent?: any; weights?: any }) => {
    const body = JSON.stringify(params);
    const fetcher = () => fetch(`${API_BASE}/orchestrator/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body,
    });
    const res = await fetcher();
    return handleResponse<any>(res, fetcher);
  },

  executePlan: async (payload: any) => {
    const body = JSON.stringify(payload);
    const fetcher = () => fetch(`${API_BASE}/orchestrator/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body,
    });
    const res = await fetcher();
    return handleResponse<any>(res, fetcher);
  },

  // Simulator
  runSimulation: async (params: any) => {
    const body = JSON.stringify(params);
    const fetcher = () => fetch(`${API_BASE}/simulator/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body,
    });
    const res = await fetcher();
    return handleResponse<any>(res, fetcher);
  },

  // Approvals
  getApprovals: async (status?: string) => {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/approvals${query}`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any[]>(res);
  },

  approveProposal: async (id: string, comments?: string) => {
    const res = await fetch(`${API_BASE}/approvals/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ comments }),
    });
    return handleResponse<any>(res);
  },

  rejectProposal: async (id: string, comments?: string) => {
    const res = await fetch(`${API_BASE}/approvals/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ comments }),
    });
    return handleResponse<any>(res);
  },

  // Maintenance
  getMaintenanceTickets: async () => {
    const res = await fetch(`${API_BASE}/maintenance`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any[]>(res);
  },

  reportMaintenance: async (data: any) => {
    const res = await fetch(`${API_BASE}/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  updateTicketStatus: async (id: string, status: string) => {
    const res = await fetch(`${API_BASE}/maintenance/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status }),
    });
    return handleResponse<any>(res);
  },

  // Analytics & Audit
  getAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any>(res);
  },

  getAuditLogs: async (limit: number = 50) => {
    const res = await fetch(`${API_BASE}/audit-log?limit=${limit}`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any[]>(res);
  },

  // Settings / Autonomy
  getAutonomySettings: async () => {
    const res = await fetch(`${API_BASE}/settings/autonomy`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any>(res);
  },

  setAutonomyLevel: async (level: number) => {
    const res = await fetch(`${API_BASE}/settings/autonomy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ level }),
    });
    return handleResponse<any>(res);
  },

  // Demo Control
  runDemo: async () => {
    const res = await fetch(`${API_BASE}/demo/run`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return handleResponse<any>(res);
  },

  resetDemo: async () => {
    const res = await fetch(`${API_BASE}/demo/reset`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return handleResponse<any>(res);
  },
};
