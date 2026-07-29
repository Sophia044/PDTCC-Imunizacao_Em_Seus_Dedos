// ============================================================
// CLIENTE HTTP
//
// Uma única função `apiRequest` usada por todos os arquivos em
// services/api/*. Ela cuida de:
//   - montar a URL final (API_URL + caminho)
//   - anexar o header "Authorization: Bearer <token>" quando há
//     uma sessão ativa
//   - serializar/desserializar JSON
//   - transformar respostas de erro do FastAPI (campo "detail")
//     numa mensagem amigável, lançada como Error — as telas já
//     fazem try/catch e mostram Alert.alert(...) com essa mensagem
// ============================================================

import { API_URL } from './config';
import { getCachedToken } from './token';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean; // default true — envia o token se houver um salvo
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getCachedToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw new ApiError(
      'Não foi possível conectar ao servidor. Verifique sua internet e se o backend está rodando.',
      0
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const detail = data?.detail;
    const message = Array.isArray(detail)
      ? detail.map((d: any) => d.msg).join(' ')
      : detail || 'Ocorreu um erro inesperado. Tente novamente.';
    throw new ApiError(message, response.status);
  }

  return data as T;
}
