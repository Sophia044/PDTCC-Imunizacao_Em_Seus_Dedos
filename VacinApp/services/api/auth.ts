// ============================================================
// API: Autenticação
// Login/cadastro de paciente, profissional e unidade de saúde.
// ============================================================

import { apiRequest } from './client';
import { saveSession, clearSession, type SessionType } from './token';

type TokenResponse = { token: string };

// ---------------- Paciente ----------------
export async function loginPatient(payload: { cpf: string; password: string; networkType: 'sus' | 'private' }) {
  const { token } = await apiRequest<TokenResponse>('/auth/patient/login', { method: 'POST', body: payload, auth: false });
  await saveSession(token, 'patient');
  return token;
}

export async function registerPatientSus(payload: {
  name: string; cpf: string; birthdate: string; cns: string; phone?: string; email: string; password: string;
}) {
  const { token } = await apiRequest<TokenResponse>('/auth/patient/register/sus', { method: 'POST', body: payload, auth: false });
  await saveSession(token, 'patient');
  return token;
}

export async function registerPatientPrivate(payload: {
  name: string; cpf: string; birthdate: string; convenio: string; carteirinha: string; phone?: string; email: string; password: string;
}) {
  const { token } = await apiRequest<TokenResponse>('/auth/patient/register/private', { method: 'POST', body: payload, auth: false });
  await saveSession(token, 'patient');
  return token;
}

// ---------------- Profissional ----------------
export async function loginProfessional(payload: {
  email: string; password: string; professionalRegistry: string; networkType: 'public' | 'private'; institution?: string;
}) {
  const { token } = await apiRequest<TokenResponse>('/auth/professional/login', { method: 'POST', body: payload, auth: false });
  await saveSession(token, 'professional');
  return token;
}

export async function registerProfessional(payload: {
  name: string; professionalRegistry: string; specialty?: string; unitName: string;
  networkType: 'public' | 'private'; email: string; password: string;
}) {
  const { token } = await apiRequest<TokenResponse>('/auth/professional/register', { method: 'POST', body: payload, auth: false });
  await saveSession(token, 'professional');
  return token;
}

// ---------------- Unidade de Saúde ----------------
export async function loginUnit(payload: { cnes: string; identifier: string; password: string }) {
  const { token } = await apiRequest<TokenResponse>('/auth/unit/login', { method: 'POST', body: payload, auth: false });
  await saveSession(token, 'unit');
  return token;
}

export function getMyUnit() {
  return apiRequest<{ id: string; name: string; cnes: string }>('/auth/unit/me');
}

export async function logout() {
  await clearSession();
}

export type { SessionType };
