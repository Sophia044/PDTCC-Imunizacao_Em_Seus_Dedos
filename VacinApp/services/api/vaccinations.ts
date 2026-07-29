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
  location?: string;
  notes?: string;
  networkType: string;
}

export function registerVaccination(payload: VaccinationPayload) {
  return apiRequest<Vaccine>('/vaccinations', { method: 'POST', body: payload });
}

export function listVaccinations(patientId: string) {
  return apiRequest<Vaccine[]>(`/vaccinations?patient_id=${patientId}`);
}
