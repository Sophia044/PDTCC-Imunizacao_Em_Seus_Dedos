// ============================================================
// URL BASE DA API
//
// Ordem de resolução:
//   1) Variável de ambiente EXPO_PUBLIC_API_URL (a forma
//      recomendada — crie um arquivo .env na raiz do VacinApp
//      com, por exemplo: EXPO_PUBLIC_API_URL=http://192.168.0.10:8000)
//   2) Descoberta automática a partir do endereço que o próprio
//      Expo usou para carregar o app (funciona muito bem ao
//      testar no celular físico com o Expo Go, sem precisar
//      configurar nada manualmente).
//   3) http://localhost:8000 como último recurso (ótimo para
//      rodar no navegador/emulador, mas não alcança o backend
//      a partir de um celular físico).
// ============================================================

import Constants from 'expo-constants';

function discoverApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;

  // hostUri é algo como "192.168.0.10:8081" quando rodando via Expo Go/dev server.
  const hostUri = Constants.expoConfig?.hostUri ?? (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:8000`;
    }
  }

  return 'http://localhost:8000';
}

export const API_URL = discoverApiUrl();
