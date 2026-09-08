// ============================================================
// API: Assistente Virtual (IA Local via Ollama)
//
// Este serviço encapsula a chamada ao endpoint POST /ai/ask
// do backend, que por sua vez encaminha a pergunta para o
// modelo de linguagem (Qwen2.5:14b) rodando localmente via Ollama.
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

/** Resposta retornada pelo endpoint /ai/ask */
interface AskApiResponse {
  answer: string; // Texto gerado pelo modelo de IA
}

// -------------------------------------------------------
// Função principal: envia uma pergunta e retorna a resposta da IA
// -------------------------------------------------------

/**
 * Envia uma pergunta ao Assistente Virtual e retorna o texto da resposta.
 *
 * @param question - Pergunta em linguagem natural sobre vacinação
 * @returns Texto da resposta gerada pelo modelo (Qwen2.5:14b)
 *
 * Exemplos de uso na tela:
 *   const resposta = await askAI('Quais vacinas preciso tomar com 30 anos?');
 */
export async function askAI(question: string): Promise<string> {
  // apiRequest já cuida de: token JWT, serialização JSON, e mensagens de erro
  const response = await apiRequest<AskApiResponse>('/ai/ask', {
    method: 'POST',
    body: { question } satisfies AskPayload,
  });

  return response.answer;
}
