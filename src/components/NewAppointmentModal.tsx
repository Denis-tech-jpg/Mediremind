import React, { useState } from 'react';
import { X } from 'lucide-react';
import { appointmentService, patientService } from '../services/api';
import type { Patient } from '../types';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentCreated: () => void;
}

export function NewAppointmentModal({ isOpen, onClose, onAppointmentCreated }: NewAppointmentModalProps) {
  const [step, setStep] = useState<'patient' | 'appointment'>('patient');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    appointmentDate: '',
    appointmentTime: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newPatient = await patientService.create({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null
      });
      setPatient(newPatient);
      setStep('appointment');
    } catch (error) {
      console.error('Error creating patient:', error);
    }
  };

  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    try {
      const dateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
      await appointmentService.create({
        patient_id: patient.id,
        appointment_date: dateTime.toISOString(),
        status: 'pending'
      });
      onAppointmentCreated();
      onClose();
      setFormData({
        name: '',
        phone: '',
        email: '',
        appointmentDate: '',
        appointmentTime: ''
      });
      setStep('patient');
      setPatient(null);
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 'patient' ? 'Patient Information' : 'Schedule Appointment'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4">
          {step === 'patient' ? (
            <form onSubmit={handlePatientSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Next
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAppointmentSubmit} className="space-y-4">
              <div>
                <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700">
                  Appointment Date
                </label>
                <input
                  type="date"
                  id="appointmentDate"
                  name="appointmentDate"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700">
                  Appointment Time
                </label>
                <input
                  type="time"
                  id="appointmentTime"
                  name="appointmentTime"
                  required
                  value={formData.appointmentTime}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep('patient')}
                  className="text-gray-600 hover:text-gray-700"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Schedule Appointment
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}