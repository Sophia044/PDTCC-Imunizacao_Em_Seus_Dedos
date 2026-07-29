// ============================================================
// API: Unidades de saúde (mapa)
// ============================================================

import type { HealthUnit } from '@/constants/MockData';
import { apiRequest } from './client';

export function listHealthUnits(coords?: { latitude: number; longitude: number }) {
  const qs = coords ? `?lat=${coords.latitude}&lng=${coords.longitude}` : '';
  return apiRequest<HealthUnit[]>(`/health-units${qs}`, { auth: false });
}
