// ============================================================
// ARMAZENAMENTO DO TOKEN DE AUTENTICAÇÃO
//
// Guarda o token JWT em disco (AsyncStorage) para a sessão
// sobreviver ao fechar o app, e mantém uma cópia em memória para
// que o client.ts consiga anexar o header "Authorization" em
// chamadas síncronas sem precisar de "await" toda hora.
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@vacinapp/auth_token';
const SESSION_TYPE_KEY = '@vacinapp/session_type';

export type SessionType = 'patient' | 'professional' | 'unit';

let cachedToken: string | null = null;
let cachedSessionType: SessionType | null = null;

export async function loadStoredSession(): Promise<{ token: string | null; sessionType: SessionType | null }> {
  const [token, sessionType] = await Promise.all([
    AsyncStorage.getItem(TOKEN_KEY),
    AsyncStorage.getItem(SESSION_TYPE_KEY),
  ]);
  cachedToken = token;
  cachedSessionType = (sessionType as SessionType | null) ?? null;
  return { token: cachedToken, sessionType: cachedSessionType };
}

export async function saveSession(token: string, sessionType: SessionType): Promise<void> {
  cachedToken = token;
  cachedSessionType = sessionType;
  await Promise.all([
    AsyncStorage.setItem(TOKEN_KEY, token),
    AsyncStorage.setItem(SESSION_TYPE_KEY, sessionType),
  ]);
}

export async function clearSession(): Promise<void> {
  cachedToken = null;
  cachedSessionType = null;
  await Promise.all([
    AsyncStorage.removeItem(TOKEN_KEY),
    AsyncStorage.removeItem(SESSION_TYPE_KEY),
  ]);
}

export function getCachedToken(): string | null {
  return cachedToken;
}

export function getCachedSessionType(): SessionType | null {
  return cachedSessionType;
}
