// ============================================================
// API: Profissionais
// ============================================================

import type { ProfessionalUser } from '@/constants/MockData';
import { apiRequest } from './client';

export function getMyProfessionalProfile() {
  return apiRequest<ProfessionalUser>('/professionals/me');
}

// Confere se o CRM/COREN informado é o mesmo do profissional
// autenticado. Usado para "liberar" a troca da unidade de saúde
// padrão na tela de Registrar Vacinação — o campo vem travado com
// a unidade vinculada ao profissional e só pode ser alterado após
// essa confirmação.
export function verifyProfessionalRegistry(professionalRegistry: string) {
  return apiRequest<{ verified: boolean }>('/professionals/me/verify-registry', {
    method: 'POST',
    body: { professionalRegistry },
  });
}
