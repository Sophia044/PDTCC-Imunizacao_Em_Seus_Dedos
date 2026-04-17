// Tipos e dados mockados para o VacinApp

export type VaccineStatus = 'complete' | 'pending' | 'overdue';
export type HealthUnitType = 'SUS' | 'Particular';

export interface Vaccine {
  id: string;
  name: string;
  date: string;
  status: VaccineStatus;
  dose: string;
  location?: string;
  nextDose?: string;
  notes?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  cpf: string;
  lastVaccine: string;
  lastVaccineDate: string;
  pendingCount: number;
}

export interface HealthUnit {
  id: string;
  name: string;
  address: string;
  distance: string;
  type: HealthUnitType;
  hours: string;
  phone: string;
  lat?: number;
  lng?: number;
}

// ── Vacinas do paciente mockado ────────────────────────────────────────────────
export const mockVaccines: Vaccine[] = [
  { id: '1', name: 'COVID-19 (Pfizer)', date: '2024-01-15', status: 'complete', dose: 'Dose de Reforço', location: 'UBS Central', notes: 'Sem reações adversas' },
  { id: '2', name: 'Influenza', date: '2024-04-10', status: 'pending', dose: 'Dose Anual', nextDose: '2024-04-10' },
  { id: '3', name: 'Hepatite B', date: '2024-02-20', status: 'overdue', dose: '3ª Dose', nextDose: '2024-02-20' },
  { id: '4', name: 'Febre Amarela', date: '2023-09-05', status: 'complete', dose: 'Dose Única', location: 'Clínica Vida Saúde' },
  { id: '5', name: 'Tétano e Difteria (dT)', date: '2024-05-01', status: 'pending', dose: 'Reforço Decenal', nextDose: '2024-05-01' },
  { id: '6', name: 'HPV', date: '2023-07-14', status: 'complete', dose: '2ª Dose', location: 'UBS Jardim América' },
  { id: '7', name: 'Meningocócica ACWY', date: '2024-03-05', status: 'overdue', dose: '1ª Dose', nextDose: '2024-03-05' },
];

// ── Marcações do calendário ────────────────────────────────────────────────────
export const mockCalendarMarks: Record<string, any> = {
  '2024-01-15': { dots: [{ key: 'c1', color: '#588C5A' }] },
  '2024-02-20': { dots: [{ key: 'p1', color: '#D9534F' }] },
  '2024-04-10': { dots: [{ key: 'p2', color: '#E8A838' }] },
  '2024-05-01': { dots: [{ key: 'p3', color: '#E8A838' }] },
  '2023-09-05': { dots: [{ key: 'c2', color: '#588C5A' }] },
  '2023-07-14': { dots: [{ key: 'c3', color: '#588C5A' }] },
  '2024-03-05': { dots: [{ key: 'o1', color: '#D9534F' }] },
};

// ── Pacientes do profissional ──────────────────────────────────────────────────
export const mockPatients: Patient[] = [
  { id: '1', name: 'Ana Clara Souza', age: 28, cpf: '123.456.789-00', lastVaccine: 'COVID-19', lastVaccineDate: '15/01/2024', pendingCount: 1 },
  { id: '2', name: 'Carlos Eduardo Lima', age: 45, cpf: '987.654.321-00', lastVaccine: 'Influenza', lastVaccineDate: '10/03/2024', pendingCount: 2 },
  { id: '3', name: 'Mariana Ferreira', age: 33, cpf: '456.789.123-00', lastVaccine: 'Hepatite B', lastVaccineDate: '20/02/2024', pendingCount: 0 },
  { id: '4', name: 'João Pedro Alves', age: 12, cpf: '321.654.987-00', lastVaccine: 'HPV', lastVaccineDate: '14/07/2023', pendingCount: 3 },
  { id: '5', name: 'Fernanda Costa', age: 67, cpf: '789.123.456-00', lastVaccine: 'Febre Amarela', lastVaccineDate: '05/09/2023', pendingCount: 1 },
];

// ── Postos de saúde ────────────────────────────────────────────────────────────
export const mockHealthUnits: HealthUnit[] = [
  { id: '1', name: 'UBS Central', address: 'R. das Flores, 123 — Centro', distance: '0,5 km', type: 'SUS', hours: 'Seg–Sex 07h–17h', phone: '(11) 3000-0001' },
  { id: '2', name: 'UBS Jardim América', address: 'Av. Brasil, 456 — Jd. América', distance: '1,2 km', type: 'SUS', hours: 'Seg–Sex 07h–19h', phone: '(11) 3000-0002' },
  { id: '3', name: 'Clínica Vida Saúde', address: 'R. das Acácias, 789 — Vila Nova', distance: '2,1 km', type: 'Particular', hours: 'Seg–Sáb 08h–20h', phone: '(11) 4000-1234' },
  { id: '4', name: 'UBS Vila Esperança', address: 'R. da Paz, 321 — Vila Esperança', distance: '3,0 km', type: 'SUS', hours: 'Seg–Sex 07h–17h', phone: '(11) 3000-0003' },
  { id: '5', name: 'Centro de Imunização Premium', address: 'Av. Paulista, 1000 — Bela Vista', distance: '4,5 km', type: 'Particular', hours: 'Todos os dias 08h–22h', phone: '(11) 5000-5678' },
];

// ── Vacinas disponíveis (para registro) ───────────────────────────────────────
export const availableVaccines = [
  'BCG', 'Hepatite B', 'Penta (DTP+Hib+HB)', 'VIP (Poliomielite)',
  'VRH (Rotavírus)', 'Pneumocócica 10V', 'Meningocócica C',
  'Febre Amarela', 'Tríplice Viral (SCR)', 'Varicela',
  'Hepatite A', 'HPV', 'Meningocócica ACWY', 'COVID-19',
  'Influenza', 'Tétano e Difteria (dT)', 'Dengue (Qdenga)',
];
