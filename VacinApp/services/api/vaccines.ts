// ============================================================
// API: Catálogo de vacinas
// ============================================================

import { apiRequest } from './client';

export function listVaccineNames() {
  return apiRequest<string[]>('/vaccines');
}
