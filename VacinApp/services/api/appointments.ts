// ============================================================
// API: Agenda (appointments)
// ============================================================

import type { AppointmentItem, AppointmentStatus } from '@/constants/MockData';
import { apiRequest } from './client';

export function listAppointments(date?: string) {
  const qs = date ? `?date=${date}` : '';
  return apiRequest<AppointmentItem[]>(`/appointments${qs}`);
}

export function updateAppointmentStatus(appointmentId: string, status: AppointmentStatus) {
  return apiRequest<AppointmentItem>(`/appointments/${appointmentId}`, { method: 'PATCH', body: { status } });
}
