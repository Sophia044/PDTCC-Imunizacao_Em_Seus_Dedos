// ============================================================
// CONTEXTO DE AUTENTICAÇÃO
//
// Fonte única da sessão ativa do app (paciente, profissional ou
// unidade de saúde). Ao abrir o app, tenta restaurar a sessão
// salva no dispositivo; guarda o perfil já carregado para as
// telas não precisarem buscar tudo de novo a cada navegação.
// ============================================================

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { PatientProfile, ProfessionalUser } from '@/constants/MockData';
import * as authApi from '@/services/api/auth';
import { getMyPatientProfile } from '@/services/api/patients';
import { getMyProfessionalProfile } from '@/services/api/professionals';
import { clearSession, loadStoredSession, type SessionType } from '@/services/api/token';

interface AuthContextValue {
  isReady: boolean;
  sessionType: SessionType | null;
  patient: PatientProfile | null;
  professional: ProfessionalUser | null;
  unit: { id: string; name: string; cnes: string } | null;

  loginPatient: (cpf: string, password: string, networkType: 'sus' | 'private') => Promise<void>;
  registerPatientSus: (payload: Parameters<typeof authApi.registerPatientSus>[0]) => Promise<void>;
  registerPatientPrivate: (payload: Parameters<typeof authApi.registerPatientPrivate>[0]) => Promise<void>;

  loginProfessional: (payload: Parameters<typeof authApi.loginProfessional>[0]) => Promise<void>;
  registerProfessional: (payload: Parameters<typeof authApi.registerProfessional>[0]) => Promise<void>;

  loginUnit: (payload: Parameters<typeof authApi.loginUnit>[0]) => Promise<void>;

  logout: () => Promise<void>;
  refreshPatient: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType | null>(null);
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [professional, setProfessional] = useState<ProfessionalUser | null>(null);
  const [unit, setUnit] = useState<{ id: string; name: string; cnes: string } | null>(null);

  // Ao abrir o app, tenta restaurar a sessão salva no dispositivo.
  useEffect(() => {
    (async () => {
      const { token, sessionType: storedType } = await loadStoredSession();
      if (!token || !storedType) {
        setIsReady(true);
        return;
      }
      try {
        if (storedType === 'patient') {
          setPatient(await getMyPatientProfile());
        } else if (storedType === 'professional') {
          setProfessional(await getMyProfessionalProfile());
        } else if (storedType === 'unit') {
          setUnit(await authApi.getMyUnit());
        }
        setSessionType(storedType);
      } catch {
        // Token expirado/inválido — volta para o login.
        await clearSession();
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const loginPatient = useCallback(async (cpf: string, password: string, networkType: 'sus' | 'private') => {
    await authApi.loginPatient({ cpf, password, networkType });
    setPatient(await getMyPatientProfile());
    setSessionType('patient');
  }, []);

  const registerPatientSus = useCallback(async (payload: Parameters<typeof authApi.registerPatientSus>[0]) => {
    await authApi.registerPatientSus(payload);
    setPatient(await getMyPatientProfile());
    setSessionType('patient');
  }, []);

  const registerPatientPrivate = useCallback(async (payload: Parameters<typeof authApi.registerPatientPrivate>[0]) => {
    await authApi.registerPatientPrivate(payload);
    setPatient(await getMyPatientProfile());
    setSessionType('patient');
  }, []);

  const loginProfessional = useCallback(async (payload: Parameters<typeof authApi.loginProfessional>[0]) => {
    await authApi.loginProfessional(payload);
    setProfessional(await getMyProfessionalProfile());
    setSessionType('professional');
  }, []);

  const registerProfessional = useCallback(async (payload: Parameters<typeof authApi.registerProfessional>[0]) => {
    await authApi.registerProfessional(payload);
    setProfessional(await getMyProfessionalProfile());
    setSessionType('professional');
  }, []);

  const loginUnit = useCallback(async (payload: Parameters<typeof authApi.loginUnit>[0]) => {
    await authApi.loginUnit(payload);
    setUnit(await authApi.getMyUnit());
    setSessionType('unit');
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setPatient(null);
    setProfessional(null);
    setUnit(null);
    setSessionType(null);
  }, []);

  const refreshPatient = useCallback(async () => {
    setPatient(await getMyPatientProfile());
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    isReady, sessionType, patient, professional, unit,
    loginPatient, registerPatientSus, registerPatientPrivate,
    loginProfessional, registerProfessional,
    loginUnit, logout, refreshPatient,
  }), [isReady, sessionType, patient, professional, unit, loginPatient, registerPatientSus, registerPatientPrivate, loginProfessional, registerProfessional, loginUnit, logout, refreshPatient]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa ser usado dentro de <AuthProvider>');
  return ctx;
}
