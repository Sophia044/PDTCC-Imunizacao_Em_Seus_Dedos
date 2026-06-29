// ============================================================
// CONSTANTES: Dados Mockados (Simulados) do VacinApp
// DESCRIÇÃO: Define os tipos TypeScript e os dados de exemplo que
//            simulam as respostas de uma API real. Em produção,
//            todos esses dados serão substituídos por chamadas ao
//            back-end Python via endpoints REST.
// ============================================================

// -------------------------------------------------------
// TIPOS: Definições de status e categorias do sistema
// -------------------------------------------------------

// Status possíveis para uma vacina no histórico do paciente
export type VaccineStatus = 'complete' | 'pending' | 'overdue';

// Tipo de estabelecimento de saúde
export type HealthUnitType = 'SUS' | 'Particular';

// Tipo de rede do profissional
export type ProfessionalNetworkType = 'public' | 'private';

// Status de um agendamento na agenda do profissional
export type AppointmentStatus = 'scheduled' | 'done' | 'missed';

// Filtro de busca de paciente
export type PatientSearchFilter = 'name' | 'cpf' | 'sus' | 'plan';

// -------------------------------------------------------
// INTERFACE: Vacina
// Define o formato de dados de uma vacina no sistema
// -------------------------------------------------------
export interface Vaccine {
  id: string;            // Identificador único da vacina
  name: string;          // Nome da vacina (ex: "COVID-19 Pfizer")
  date: string;          // Data de aplicação ou agendamento (formato YYYY-MM-DD)
  status: VaccineStatus; // Status atual: complete | pending | overdue
  dose: string;          // Número ou nome da dose (ex: "2ª Dose", "Reforço")
  location?: string;     // Local onde foi tomada (ex: "UBS Central") — opcional
  nextDose?: string;     // Data prevista para a próxima dose — opcional
  notes?: string;        // Observações adicionais (ex: "Sem reações adversas") — opcional
}

// -------------------------------------------------------
// INTERFACE: Paciente (resumido — lista e home)
// Define o formato de dados de um paciente no sistema
// -------------------------------------------------------
export interface Patient {
  id: string;             // Identificador único do paciente
  name: string;           // Nome completo
  age: number;            // Idade em anos
  cpf: string;            // CPF formatado (000.000.000-00)
  lastVaccine: string;    // Nome da última vacina aplicada
  lastVaccineDate: string;// Data da última vacina (formato DD/MM/YYYY)
  pendingCount: number;   // Número de vacinas com dose pendente
}

// -------------------------------------------------------
// INTERFACE: PatientProfile (expandido — perfil completo)
// Inclui todos os dados do paciente, retornados pelo backend
// ao abrir o perfil. Estende Patient com dados clínicos.
// -------------------------------------------------------
export interface PatientProfile extends Patient {
  sus: string;             // Número do Cartão Nacional de Saúde (CNS)
  plan: string;            // Convênio/plano de saúde (ex: "Unimed", "SUS")
  bloodType: string;       // Tipo sanguíneo (ex: "O+", "A-")
  allergies: string[];     // Lista de alergias conhecidas
  vaccines: Vaccine[];     // Histórico vacinal completo
  pendingVaccines: string[];  // Nomes das vacinas pendentes
  overdueVaccines: string[]; // Nomes das vacinas atrasadas
}

// -------------------------------------------------------
// INTERFACE: ProfessionalUser
// Representa o profissional autenticado no sistema.
// Futuramente retornado pelo endpoint /auth/professional/login
// -------------------------------------------------------
export interface ProfessionalUser {
  id: string;                     // ID único no sistema
  name: string;                   // Nome completo
  role: string;                   // Cargo retornado pelo backend (ex: "Médico", "Enfermeiro")
  registry: string;               // Registro profissional (CRM ou COREN)
  networkType: ProfessionalNetworkType; // Rede de atuação
  unit: string;                   // Unidade de saúde (Rede Pública) ou vazio
  institution?: string;           // Instituição privada (Rede Privada) ou vazio
}

// -------------------------------------------------------
// INTERFACE: AppointmentItem
// Item da agenda do profissional (Rede Privada).
// Futuramente retornado pelo endpoint /professional/appointments/today
// -------------------------------------------------------
export interface AppointmentItem {
  id: string;            // ID único do agendamento
  date: string;          // Data do agendamento (formato YYYY-MM-DD)
  time: string;          // Horário formatado (ex: "08:30")
  patientId: string;     // ID do paciente — usado para navegar ao perfil
  patientName: string;   // Nome do paciente
  vaccine: string;       // Vacina prevista para a consulta
  plan: string;          // Convênio/plano do paciente
  status: AppointmentStatus; // scheduled | done | missed
}

// -------------------------------------------------------
// INTERFACE: Campaign (Campanha Vacinal)
// Representa uma campanha vacinal ativa na unidade.
// -------------------------------------------------------
export interface Campaign {
  id: string;       // ID único da campanha
  name: string;     // Nome da campanha (ex: "Campanha de Influenza 2024")
  target: string;   // Público-alvo (ex: "Adultos acima de 60 anos")
  deadline: string; // Data limite (DD/MM/YYYY)
  applied: number;  // Doses aplicadas até o momento
  goal: number;     // Meta total de doses
}

// -------------------------------------------------------
// INTERFACE: StockItem (Item de Estoque de Vacinas)
// Representa o estoque de uma vacina na unidade.
// -------------------------------------------------------
export interface StockItem {
  id: string;       // ID do item
  vaccine: string;  // Nome da vacina
  quantity: number; // Quantidade atual em estoque
  minLevel: number; // Nível mínimo — abaixo disso é alerta de estoque baixo
}

// -------------------------------------------------------
// INTERFACE: Unidade de Saúde (Posto de Vacinação)
// Define o formato de dados de um estabelecimento de saúde
// -------------------------------------------------------
export interface HealthUnit {
  id: string;             // Identificador único do estabelecimento
  name: string;           // Nome do posto (ex: "UBS Central")
  address: string;        // Endereço completo
  distance: string;       // Distância aproximada do usuário (ex: "1,2 km")
  type: HealthUnitType;   // 'SUS' ou 'Particular'
  hours: string;          // Horário de funcionamento (ex: "Seg-Sex 07h-17h")
  phone: string;          // Telefone de contato
  lat?: number;           // Latitude para geolocalização — opcional
  lng?: number;           // Longitude para geolocalização — opcional
}

// -------------------------------------------------------
// DADOS DE EXEMPLO (mock)
// Esses dados simulam o retorno de uma API real.
// Em produção, serão substituídos por chamadas ao back-end Python.
// -------------------------------------------------------

// ── Vacinas do paciente mockado ──────────────────────────────────────────────
export const mockVaccines: Vaccine[] = [
  { id: '1', name: 'COVID-19 (Pfizer)', date: '2024-01-15', status: 'complete', dose: 'Dose de Reforço', location: 'UBS Central', notes: 'Sem reações adversas' },
  { id: '2', name: 'Influenza',         date: '2024-04-10', status: 'pending',  dose: 'Dose Anual',        nextDose: '2024-04-10' },
  { id: '3', name: 'Hepatite B',        date: '2024-02-20', status: 'overdue',  dose: '3ª Dose',           nextDose: '2024-02-20' },
  { id: '4', name: 'Febre Amarela',     date: '2023-09-05', status: 'complete', dose: 'Dose Única',        location: 'Clínica Vida Saúde' },
  { id: '5', name: 'Tétano e Difteria (dT)', date: '2024-05-01', status: 'pending', dose: 'Reforço Decenal', nextDose: '2024-05-01' },
  { id: '6', name: 'HPV',              date: '2023-07-14', status: 'complete', dose: '2ª Dose',           location: 'UBS Jardim América' },
  { id: '7', name: 'Meningocócica ACWY', date: '2024-03-05', status: 'overdue', dose: '1ª Dose',          nextDose: '2024-03-05' },
];

// ── Marcações do calendário vacinal ────────────────────────────────────────
export const mockCalendarMarks: Record<string, any> = {
  '2024-01-15': { dots: [{ key: 'c1', color: '#588C5A' }] },
  '2024-02-20': { dots: [{ key: 'p1', color: '#D9534F' }] },
  '2024-04-10': { dots: [{ key: 'p2', color: '#E8A838' }] },
  '2024-05-01': { dots: [{ key: 'p3', color: '#E8A838' }] },
  '2023-09-05': { dots: [{ key: 'c2', color: '#588C5A' }] },
  '2023-07-14': { dots: [{ key: 'c3', color: '#588C5A' }] },
  '2024-03-05': { dots: [{ key: 'o1', color: '#D9534F' }] },
};

// ── Pacientes resumidos (lista e home) ────────────────────────────────────
export const mockPatients: Patient[] = [
  { id: '1', name: 'Ana Clara Souza',     age: 28, cpf: '123.456.789-00', lastVaccine: 'COVID-19',      lastVaccineDate: '15/01/2024', pendingCount: 1 },
  { id: '2', name: 'Carlos Eduardo Lima', age: 45, cpf: '987.654.321-00', lastVaccine: 'Influenza',     lastVaccineDate: '10/03/2024', pendingCount: 2 },
  { id: '3', name: 'Mariana Ferreira',    age: 33, cpf: '456.789.123-00', lastVaccine: 'Hepatite B',    lastVaccineDate: '20/02/2024', pendingCount: 0 },
  { id: '4', name: 'João Pedro Alves',    age: 12, cpf: '321.654.987-00', lastVaccine: 'HPV',           lastVaccineDate: '14/07/2023', pendingCount: 3 },
  { id: '5', name: 'Fernanda Costa',      age: 67, cpf: '789.123.456-00', lastVaccine: 'Febre Amarela', lastVaccineDate: '05/09/2023', pendingCount: 1 },
];

// ── Perfis completos dos pacientes (perfil detalhado) ─────────────────────
// Futuramente retornado por GET /patients/{id}/profile
export const mockPatientProfiles: PatientProfile[] = [
  {
    id: '1', name: 'Ana Clara Souza', age: 28,
    cpf: '123.456.789-00', sus: '700 0012 3456 7890',
    plan: 'Unimed', bloodType: 'A+',
    lastVaccine: 'COVID-19', lastVaccineDate: '15/01/2024', pendingCount: 1,
    allergies: ['Penicilina', 'Dipirona'],
    vaccines: [
      { id: 'v1', name: 'COVID-19 (Pfizer)', date: '2024-01-15', status: 'complete', dose: 'Reforço', location: 'UBS Central' },
      { id: 'v2', name: 'Febre Amarela',     date: '2023-09-05', status: 'complete', dose: 'Dose Única', location: 'Clínica Vida Saúde' },
      { id: 'v3', name: 'Influenza',         date: '2024-04-10', status: 'pending',  dose: 'Dose Anual',  nextDose: '2024-04-10' },
    ],
    pendingVaccines: ['Influenza'],
    overdueVaccines: [],
  },
  {
    id: '2', name: 'Carlos Eduardo Lima', age: 45,
    cpf: '987.654.321-00', sus: '700 0098 7654 3210',
    plan: 'SUS', bloodType: 'O-',
    lastVaccine: 'Influenza', lastVaccineDate: '10/03/2024', pendingCount: 2,
    allergies: [],
    vaccines: [
      { id: 'v4', name: 'Influenza',   date: '2024-03-10', status: 'complete', dose: 'Dose Anual',  location: 'UBS Jardim América' },
      { id: 'v5', name: 'Hepatite B',  date: '2024-02-20', status: 'overdue',  dose: '3ª Dose',     nextDose: '2024-02-20' },
      { id: 'v6', name: 'Tétano (dT)', date: '2024-05-01', status: 'pending',  dose: 'Reforço',     nextDose: '2024-05-01' },
    ],
    pendingVaccines: ['Tétano (dT)'],
    overdueVaccines: ['Hepatite B'],
  },
  {
    id: '3', name: 'Mariana Ferreira', age: 33,
    cpf: '456.789.123-00', sus: '700 0045 6789 1230',
    plan: 'Bradesco Saúde', bloodType: 'B+',
    lastVaccine: 'Hepatite B', lastVaccineDate: '20/02/2024', pendingCount: 0,
    allergies: ['Látex'],
    vaccines: [
      { id: 'v7', name: 'Hepatite B', date: '2024-02-20', status: 'complete', dose: '3ª Dose', location: 'Clínica Vida Saúde' },
      { id: 'v8', name: 'HPV',        date: '2023-07-14', status: 'complete', dose: '2ª Dose', location: 'UBS Jardim América' },
    ],
    pendingVaccines: [],
    overdueVaccines: [],
  },
  {
    id: '4', name: 'João Pedro Alves', age: 12,
    cpf: '321.654.987-00', sus: '700 0032 1654 9870',
    plan: 'SUS', bloodType: 'AB+',
    lastVaccine: 'HPV', lastVaccineDate: '14/07/2023', pendingCount: 3,
    allergies: [],
    vaccines: [
      { id: 'v9',  name: 'HPV',                   date: '2023-07-14', status: 'complete', dose: '1ª Dose', location: 'UBS Central' },
      { id: 'v10', name: 'Meningocócica ACWY',    date: '2024-03-05', status: 'overdue',  dose: '1ª Dose', nextDose: '2024-03-05' },
      { id: 'v11', name: 'HPV',                   date: '2024-01-14', status: 'overdue',  dose: '2ª Dose', nextDose: '2024-01-14' },
      { id: 'v12', name: 'Varicela (reforço)',     date: '2024-06-01', status: 'pending',  dose: 'Reforço', nextDose: '2024-06-01' },
    ],
    pendingVaccines: ['Varicela (reforço)'],
    overdueVaccines: ['Meningocócica ACWY', 'HPV 2ª Dose'],
  },
  {
    id: '5', name: 'Fernanda Costa', age: 67,
    cpf: '789.123.456-00', sus: '700 0078 9123 4560',
    plan: 'SulAmérica', bloodType: 'O+',
    lastVaccine: 'Febre Amarela', lastVaccineDate: '05/09/2023', pendingCount: 1,
    allergies: ['Ovo', 'Gelatina'],
    vaccines: [
      { id: 'v13', name: 'Febre Amarela', date: '2023-09-05', status: 'complete', dose: 'Dose Única',  location: 'Centro de Imunização Premium' },
      { id: 'v14', name: 'Influenza',     date: '2024-04-10', status: 'pending',  dose: 'Dose Anual',  nextDose: '2024-04-10' },
    ],
    pendingVaccines: ['Influenza'],
    overdueVaccines: [],
  },
];

// ── Profissional logado (mock) ────────────────────────────────────────────
// Futuramente retornado por POST /auth/professional/login
// Dois exemplos: um para Rede Pública, um para Rede Privada

export const mockProfessionalPublic: ProfessionalUser = {
  id: 'prof-001',
  name: 'Fernanda Alves',
  role: 'Enfermeira',          // Retornado pelo backend via CRM/COREN
  registry: 'COREN/SP-123456',
  networkType: 'public',
  unit: 'UBS Jardim América',
};

export const mockProfessionalPrivate: ProfessionalUser = {
  id: 'prof-002',
  name: 'Ricardo Oliveira',
  role: 'Médico',              // Retornado pelo backend via CRM/COREN
  registry: 'CRM/SP-98765',
  networkType: 'private',
  unit: '',
  institution: 'Clínica Vida Saúde',
};

// Helper para gerar datas ISO relativas (para testes de calendário)
const getIsoDate = (offsetDays: number = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const TODAY_ISO = getIsoDate(0);
export const TOMORROW_ISO = getIsoDate(1);
export const YESTERDAY_ISO = getIsoDate(-1);
export const IN_2_DAYS_ISO = getIsoDate(2);

// ── Agenda da Rede Privada (Agendamentos) ─────────────────────────────────
// Futuramente retornado por GET /professional/appointments?date={date}
export const mockAppointments: AppointmentItem[] = [
  { id: 'apt-1', date: TODAY_ISO,     time: '08:00', patientId: '1', patientName: 'Ana Clara Souza',     vaccine: 'Influenza',          plan: 'Unimed',           status: 'done'      },
  { id: 'apt-2', date: TODAY_ISO,     time: '09:30', patientId: '5', patientName: 'Fernanda Costa',      vaccine: 'Influenza',          plan: 'SulAmérica',       status: 'scheduled' },
  { id: 'apt-3', date: TODAY_ISO,     time: '10:00', patientId: '2', patientName: 'Carlos Eduardo Lima', vaccine: 'Tétano (dT)',        plan: 'SUS',              status: 'scheduled' },
  { id: 'apt-4', date: TODAY_ISO,     time: '11:30', patientId: '3', patientName: 'Mariana Ferreira',    vaccine: 'COVID-19 (Reforço)', plan: 'Bradesco Saúde',   status: 'scheduled' },
  { id: 'apt-5', date: TODAY_ISO,     time: '14:00', patientId: '4', patientName: 'João Pedro Alves',    vaccine: 'HPV 2ª Dose',        plan: 'SUS',              status: 'missed'    },
  { id: 'apt-6', date: TOMORROW_ISO,  time: '09:00', patientId: '1', patientName: 'Ana Clara Souza',     vaccine: 'Hepatite B',         plan: 'Unimed',           status: 'scheduled' },
  { id: 'apt-7', date: TOMORROW_ISO,  time: '10:30', patientId: '3', patientName: 'Mariana Ferreira',    vaccine: 'Febre Amarela',      plan: 'Bradesco Saúde',   status: 'scheduled' },
  { id: 'apt-8', date: IN_2_DAYS_ISO, time: '14:30', patientId: '5', patientName: 'Fernanda Costa',      vaccine: 'Dengue (Qdenga)',    plan: 'SulAmérica',       status: 'scheduled' },
  { id: 'apt-9', date: YESTERDAY_ISO, time: '11:00', patientId: '2', patientName: 'Carlos Eduardo Lima', vaccine: 'Tríplice Viral',     plan: 'SUS',              status: 'done'      },
];


// ── Campanhas vacinais ativas ─────────────────────────────────────────────
// Futuramente retornado por GET /campaigns?unit={unitId}&status=active
export const mockCampaigns: Campaign[] = [
  { id: 'camp-1', name: 'Campanha de Influenza 2024', target: 'Idosos acima de 60 anos', deadline: '30/06/2024', applied: 312, goal: 500 },
  { id: 'camp-2', name: 'Vacinação contra Dengue',    target: 'População de 10 a 59 anos', deadline: '31/07/2024', applied: 78,  goal: 300 },
];

// ── Estoque de vacinas da unidade ─────────────────────────────────────────
// Futuramente retornado por GET /stock?unit={unitId}
export const mockStock: StockItem[] = [
  { id: 'stk-1', vaccine: 'Influenza',      quantity: 8,  minLevel: 20 }, // ALERTA: abaixo do mínimo
  { id: 'stk-2', vaccine: 'COVID-19',       quantity: 45, minLevel: 10 },
  { id: 'stk-3', vaccine: 'Hepatite B',     quantity: 3,  minLevel: 15 }, // ALERTA: abaixo do mínimo
  { id: 'stk-4', vaccine: 'Febre Amarela',  quantity: 22, minLevel: 10 },
];

// ── Postos de saúde próximos ao usuário ──────────────────────────────────
export const mockHealthUnits: HealthUnit[] = [
  { id: '1', name: 'UBS Central',                 address: 'R. das Flores, 123 — Centro',       distance: '0,5 km', type: 'SUS',        hours: 'Seg–Sex 07h–17h', phone: '(11) 3000-0001' },
  { id: '2', name: 'UBS Jardim América',           address: 'Av. Brasil, 456 — Jd. América',     distance: '1,2 km', type: 'SUS',        hours: 'Seg–Sex 07h–19h', phone: '(11) 3000-0002' },
  { id: '3', name: 'Clínica Vida Saúde',           address: 'R. das Acácias, 789 — Vila Nova',   distance: '2,1 km', type: 'Particular', hours: 'Seg–Sáb 08h–20h', phone: '(11) 4000-1234' },
  { id: '4', name: 'UBS Vila Esperança',           address: 'R. da Paz, 321 — Vila Esperança',   distance: '3,0 km', type: 'SUS',        hours: 'Seg–Sex 07h–17h', phone: '(11) 3000-0003' },
  { id: '5', name: 'Centro de Imunização Premium', address: 'Av. Paulista, 1000 — Bela Vista',   distance: '4,5 km', type: 'Particular', hours: 'Todos os dias 08h–22h', phone: '(11) 5000-5678' },
];

// ── Vacinas disponíveis para registro pelo profissional ─────────────────
export const availableVaccines = [
  'BCG', 'Hepatite B', 'Penta (DTP+Hib+HB)', 'VIP (Poliomielite)',
  'VRH (Rotavírus)', 'Pneumocócica 10V', 'Meningocócica C',
  'Febre Amarela', 'Tríplice Viral (SCR)', 'Varicela',
  'Hepatite A', 'HPV', 'Meningocócica ACWY', 'COVID-19',
  'Influenza', 'Tétano e Difteria (dT)', 'Dengue (Qdenga)',
];

// ── Fabricantes de vacinas ────────────────────────────────────────────────
export const availableManufacturers = [
  'Pfizer', 'AstraZeneca', 'Janssen', 'Moderna', 'Butantan',
  'Bio-Manguinhos (Fiocruz)', 'GSK', 'Sanofi', 'MSD', 'Outro',
];
