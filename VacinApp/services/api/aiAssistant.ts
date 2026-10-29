// ============================================================
// API: Assistente Virtual (IA Local via Ollama + RAG)
//
// Este serviço encapsula a chamada ao endpoint POST /ai/ask
// do backend, que realiza a busca vetorial nos documentos oficiais
// de vacinação (RAG) e encaminha a pergunta para o modelo de
// linguagem (Qwen2.5:14b) rodando localmente via Ollama.
//
// Padrão idêntico ao dos outros serviços em services/api/:
//   - Usa apiRequest() do client.ts (já trata token JWT e erros HTTP)
//   - Exporta uma função tipada por operação
// ============================================================

import { apiRequest } from './client';

// -------------------------------------------------------
// Tipos que espelham os schemas do backend (ai_assistant.py)
// -------------------------------------------------------

/** Payload enviado ao endpoint /ai/ask */
interface AskPayload {
  question: string; // Texto da pergunta do usuário
}

/** Resposta retornada pelo endpoint /ai/ask com metadados RAG */
export interface AskApiResponse {
  answer: string;                  // Texto gerado pelo modelo de IA
  baseado_em_documentos: boolean;  // True se a resposta é fundamentada nos PDFs oficiais
  fontes: string[];                // Nomes dos arquivos consultados
}

// -------------------------------------------------------
// Função principal: envia uma pergunta e retorna a resposta da IA com metadados
// -------------------------------------------------------

/**
 * Envia uma pergunta ao Assistente Virtual e retorna a resposta e sua procedência.
 *
 * @param question - Pergunta em linguagem natural sobre vacinação
 * @returns Resposta com o texto gerado, se é baseado em documentos e fontes
 *
 * Exemplos de uso na tela:
 *   const { answer, baseado_em_documentos } = await askAI('Quais vacinas preciso tomar com 30 anos?');
 */
export async function askAI(question: string): Promise<AskApiResponse> {
  const response = await apiRequest<AskApiResponse>('/ai/ask', {
    method: 'POST',
    body: { question } satisfies AskPayload,
  });

  return response;
}
