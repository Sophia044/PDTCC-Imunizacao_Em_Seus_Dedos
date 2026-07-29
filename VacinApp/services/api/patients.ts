// ============================================================
// API: Pacientes
// ============================================================

import type { Patient, PatientProfile, PatientSearchFilter } from '@/constants/MockData';
import { apiRequest } from './client';

export function getMyPatientProfile() {
  return apiRequest<PatientProfile>('/patients/me');
}

export function listPatients(query?: string) {
  const qs = query ? `?query=${encodeURIComponent(query)}` : '';
  return apiRequest<Patient[]>(`/patients${qs}`);
}

export function searchPatients(query: string, filter: PatientSearchFilter) {
  const params = new URLSearchParams({ query, filter });
  return apiRequest<PatientProfile[]>(`/patients/search?${params.toString()}`);
}

export function getPatientProfile(patientId: string) {
  return apiRequest<PatientProfile>(`/patients/${patientId}`);
}
