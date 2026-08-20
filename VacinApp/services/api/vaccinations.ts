// ============================================================
// API: Registro de vacinação
// Usado pela tela "Registrar Vacinação" do profissional.
// ============================================================

import type { Vaccine } from '@/constants/MockData';
import { apiRequest } from './client';

export interface VaccinationPayload {
  patientId: string;
  vaccine: string;
  dose: string;
  manufacturer?: string;
  lot?: string;
  date: string; // DD/MM/YYYY
  // ID de uma unidade de saúde válida (ver services/api/healthUnits.ts).
  // Substitui o antigo campo de texto livre "location", que nunca era
  // realmente usado pelo backend — o registro sempre foi gravado com a
  // unidade vinculada ao profissional, independente do que era digitado.
  healthUnitId: string;
  notes?: string;
  networkType: string;
}

export function registerVaccination(payload: VaccinationPayload) {
  return apiRequest<Vaccine>('/vaccinations', { method: 'POST', body: payload });
}

export function listVaccinations(patientId: string) {
  return apiRequest<Vaccine[]>(`/vaccinations?patient_id=${patientId}`);
}
