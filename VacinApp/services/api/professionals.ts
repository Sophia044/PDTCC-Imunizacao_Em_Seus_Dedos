// ============================================================
// API: Profissionais
// ============================================================

import type { ProfessionalUser } from '@/constants/MockData';
import { apiRequest } from './client';

export function getMyProfessionalProfile() {
  return apiRequest<ProfessionalUser>('/professionals/me');
}
