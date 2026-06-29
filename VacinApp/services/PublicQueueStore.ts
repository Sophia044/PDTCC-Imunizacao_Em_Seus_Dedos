import { mockPatientProfiles } from '../constants/MockData';
import type { PatientProfile } from '../constants/MockData';

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

let publicVaccinationQueue: PublicQueueItem[] = [
  {
    id: 'queue-001',
    patientId: '2',
    arrivalTime: '08:10',
    reason: 'Vacinação de rotina',
    status: 'waiting',
  },
  {
    id: 'queue-002',
    patientId: '4',
    arrivalTime: '08:25',
    reason: 'Dose pendente',
    status: 'waiting',
  },
  {
    id: 'queue-003',
    patientId: '1',
    arrivalTime: '08:40',
    reason: 'Campanha de Influenza',
    status: 'waiting',
  },
];

const buildQueuePatients = (): PublicQueuePatient[] =>
  publicVaccinationQueue
    .map((item, index) => {
      const patient = mockPatientProfiles.find(p => p.id === item.patientId);
      if (!patient) return null;

      return {
        ...item,
        patient,
        position: index + 1,
      };
    })
    .filter((item): item is PublicQueuePatient => Boolean(item));

export const getPublicVaccinationQueue = () => buildQueuePatients();

export const findPatientBySus = (sus: string) => {
  const query = sus.replace(/\D/g, '');
  return mockPatientProfiles.find(patient => patient.sus.replace(/\D/g, '') === query);
};

export const addPatientToPublicQueue = (patientId: string, reason = 'Vacinação') => {
  const existing = publicVaccinationQueue.find(item => item.patientId === patientId && item.status === 'waiting');
  if (existing) return existing;

  const now = new Date();
  const arrivalTime = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const item: PublicQueueItem = {
    id: `queue-${Date.now()}`,
    patientId,
    arrivalTime,
    reason,
    status: 'waiting',
  };

  publicVaccinationQueue = [...publicVaccinationQueue, item];
  return item;
};

export const callNextPublicQueuePatient = () => {
  const nextPatient = publicVaccinationQueue.find(item => item.status === 'waiting');
  if (!nextPatient) return undefined;

  publicVaccinationQueue = publicVaccinationQueue.map(item =>
    item.id === nextPatient.id ? { ...item, status: 'called' } : item
  );

  return nextPatient;
};

export const removePublicQueuePatient = (queueId: string) => {
  publicVaccinationQueue = publicVaccinationQueue.filter(item => item.id !== queueId);
};
