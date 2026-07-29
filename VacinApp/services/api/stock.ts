// ============================================================
// API: Estoque de vacinas
// ============================================================

import type { StockItem } from '@/constants/MockData';
import { apiRequest } from './client';

export function listStock() {
  return apiRequest<StockItem[]>('/stock');
}
