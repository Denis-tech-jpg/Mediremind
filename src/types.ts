export interface Patient {
  id: number;
  name: string;
  phone: string;
  email: string | null;
}

export interface Appointment {
  id: number;
  patient_id: number;
  appointment_date: string;
  status: 'pending' | 'reminded' | 'completed';
  patient?: Patient;
}