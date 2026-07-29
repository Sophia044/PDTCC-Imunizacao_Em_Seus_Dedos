// ============================================================
// FILA PÚBLICA DE VACINAÇÃO (TRIAGEM)
//
// Antes: array em memória, perdido ao reiniciar o app.
// Agora: chamadas reais para o backend (persistido no banco),
// mantendo exatamente as mesmas funções exportadas para que as
// telas que já usavam este serviço (triage.tsx, home do
// profissional, register-vaccine.tsx) só precisem adicionar
// "await" nas chamadas — nenhuma mudança de layout.
// ============================================================

import type { PatientProfile } from '../constants/MockData';
import { apiRequest, ApiError } from './api/client';

export type PublicQueueStatus = 'waiting' | 'called';

export interface PublicQueueItem {
  id: string;
  patientId: string;
  arrivalTime: string;
  reason: string;
  status: PublicQueueStatus;
}

export interface PublicQueuePatient extends PublicQueueItem {
  patient: PatientProfile;
  position: number;
}

export const getPublicVaccinationQueue = () => apiRequest<PublicQueuePatient[]>('/queue');

export const findPatientBySus = async (sus: string): Promise<PatientProfile | undefined> => {
  try {
    return await apiRequest<PatientProfile>(`/queue/find-patient?sus=${encodeURIComponent(sus)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
};

export const addPatientToPublicQueue = (patientId: string, reason = 'Vacinação') =>
  apiRequest<PublicQueuePatient>('/queue', { method: 'POST', body: { patientId, reason } });

export const callNextPublicQueuePatient = async (): Promise<PublicQueuePatient | undefined> => {
  const queue = await getPublicVaccinationQueue();
  const next = queue.find(item => item.status === 'waiting');
  if (!next) return undefined;
  return apiRequest<PublicQueuePatient>(`/queue/${next.id}/call`, { method: 'POST' });
};

export const removePublicQueuePatient = (queueId: string) =>
  apiRequest<void>(`/queue/${queueId}`, { method: 'DELETE' });
