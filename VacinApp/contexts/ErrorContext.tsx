// ============================================================
// CONTEXTO DE ERROS
//
// Mostra qualquer erro do app num pop-up (ErrorModal). Três
// caminhos alimentam esse pop-up:
//
//   1) Erros de API: o client.ts avisa este contexto sempre que
//      uma requisição falha (sem conexão, 401, 404, 500...).
//      Isso cobre também as telas que antes engoliam o erro em
//      `.catch(() => {})`.
//
//   2) useError().showError(erro, titulo?): uso manual em qualquer
//      tela.
//
//   3) Alert.alert(...) simples (sem botões de ação): passa a abrir
//      este mesmo pop-up. Assim os avisos das telas de login e
//      cadastro também aparecem na web, onde Alert.alert é ignorado.
//      Alerts COM botões (ex.: confirmação de "Sair") continuam
//      usando o Alert nativo.
//
// Mensagens iguais em sequência curta são exibidas uma única vez
// (evita pop-up duplo quando a API e a tela avisam o mesmo erro).
// ============================================================

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { ErrorModal } from '../components/ErrorModal';
import { setApiErrorListener } from '../services/api/client';

interface ErrorState {
  title: string;
  message: string;
}

interface ErrorContextValue {
  showError: (error: unknown, title?: string) => void;
  hideError: () => void;
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

const DUPLICATE_WINDOW_MS = 1500;

function toMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error && error.message) return error.message;
  return 'Ocorreu um erro inesperado. Tente novamente.';
}

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<ErrorState | null>(null);
  const lastRef = useRef<{ key: string; at: number } | null>(null);

  const present = useCallback((title: string, message: string) => {
    const key = message.trim();
    const now = Date.now();
    if (lastRef.current && lastRef.current.key === key && now - lastRef.current.at < DUPLICATE_WINDOW_MS) return;
    lastRef.current = { key, at: now };
    setCurrent({ title, message });
  }, []);

  const hideError = useCallback(() => setCurrent(null), []);

  const showError = useCallback(
    (error: unknown, title = 'Ops, algo deu errado') => present(title, toMessage(error)),
    [present]
  );

  // 1) Erros vindos da API
  useEffect(() => {
    setApiErrorListener((message, title) => present(title, message));
    return () => setApiErrorListener(null);
  }, [present]);

  // 3) Alert.alert simples -> pop-up
  useEffect(() => {
    const alertApi = Alert as any;
    const originalAlert = alertApi.alert;

    alertApi.alert = (title: string, message?: string, buttons?: any[], options?: any) => {
      // Com 2+ botões é uma confirmação (ex.: "Sair da conta"): mantém o comportamento nativo.
      if (buttons && buttons.length > 1) {
        originalAlert(title, message, buttons, options);
        return;
      }
      present(title || 'Aviso', message ?? '');
    };

    return () => { alertApi.alert = originalAlert; };
  }, [present]);

  const value = useMemo(() => ({ showError, hideError }), [showError, hideError]);

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <ErrorModal
        visible={current !== null}
        title={current?.title ?? ''}
        message={current?.message ?? ''}
        onClose={hideError}
      />
    </ErrorContext.Provider>
  );
}

export function useError(): ErrorContextValue {
  const ctx = useContext(ErrorContext);
  if (!ctx) throw new Error('useError precisa ser usado dentro de <ErrorProvider>');
  return ctx;
}
