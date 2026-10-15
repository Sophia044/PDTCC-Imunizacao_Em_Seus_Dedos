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
//     numa mensagem amigável, lançada como ApiError
//   - AVISAR O POP-UP DE ERRO (ErrorContext) sempre que a
//     requisição falha, para que nenhum erro passe em silêncio.
//     Use `silent: true` quando a tela trata o erro por conta
//     própria (ex.: 404 esperado) e não quer o pop-up.
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

// -------------------------------------------------------
// Ponte com o pop-up de erro (registrada pelo ErrorProvider)
// -------------------------------------------------------
type ErrorListener = (message: string, title: string) => void;

let errorListener: ErrorListener | null = null;
let silentDepth = 0;

export function setApiErrorListener(listener: ErrorListener | null) {
  errorListener = listener;
}

/** Executa `fn` sem abrir pop-ups de erro (ex.: restaurar sessão ao abrir o app). */
export async function runWithoutErrorPopups<T>(fn: () => Promise<T>): Promise<T> {
  silentDepth++;
  try {
    return await fn();
  } finally {
    silentDepth--;
  }
}

function titleForStatus(status: number): string {
  if (status === 0) return 'Sem conexão';
  if (status === 401) return 'Não autorizado';
  if (status === 403) return 'Acesso negado';
  if (status === 404) return 'Não encontrado';
  if (status >= 500) return 'Erro no servidor';
  return 'Ops, algo deu errado';
}

function fail(message: string, status: number, silent: boolean): never {
  if (!silent && silentDepth === 0) errorListener?.(message, titleForStatus(status));
  throw new ApiError(message, status);
}

// -------------------------------------------------------
// Requisição
// -------------------------------------------------------
type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;   // default true — envia o token se houver um salvo
  silent?: boolean; // default false — true = não abre o pop-up de erro
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, silent = false } = options;

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
  } catch {
    return fail(
      'Não foi possível conectar ao servidor. Verifique sua internet e se o backend está rodando.',
      0,
      silent
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null; // resposta que não é JSON (ex.: página de erro 500)
    }
  }

  if (!response.ok) {
    const detail = data?.detail;
    const message = Array.isArray(detail)
      ? detail.map((d: any) => d.msg).join(' ')
      : detail ||
        (response.status >= 500
          ? 'O servidor encontrou um problema. Tente novamente em instantes.'
          : 'Ocorreu um erro inesperado. Tente novamente.');
    return fail(message, response.status, silent);
  }

  return data as T;
}
