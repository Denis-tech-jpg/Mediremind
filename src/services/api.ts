import axios from 'axios';
import type { Appointment, Patient } from '../types';

const API_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const appointmentService = {
  getAll: async () => {
    const response = await api.get<Appointment[]>('/appointments');
    return response.data;
  },

  create: async (appointment: Omit<Appointment, 'id'>) => {
    const response = await api.post<Appointment>('/schedule_appointment', appointment);
    return response.data;
  },

  updateStatus: async (id: number, status: Appointment['status']) => {
    const response = await api.patch<Appointment>(`/appointments/${id}`, { status });
    return response.data;
  },
};

export const patientService = {
  getAll: async () => {
    const response = await api.get<Patient[]>('/patients');
    return response.data;
  },

  create: async (patient: Omit<Patient, 'id'>) => {
    const response = await api.post<Patient>('/patients', patient);
    return response.data;
  },
};