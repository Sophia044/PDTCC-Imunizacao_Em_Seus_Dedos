// ============================================================
// API: Campanhas vacinais
// ============================================================

import type { Campaign } from '@/constants/MockData';
import { apiRequest } from './client';

export function listCampaigns() {
  return apiRequest<Campaign[]>('/campaigns');
}
