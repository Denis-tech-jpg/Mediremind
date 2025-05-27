import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Users, Plus } from 'lucide-react';
import { format } from 'date-fns';
import type { Appointment } from './types';
import { appointmentService } from './services/api';
import { NewAppointmentModal } from './components/NewAppointmentModal';

function App() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getAll();
      setAppointments(data);
      setError(null);
    } catch (err) {
      setError('Failed to load appointments. Please try again later.');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleSendReminder = async (appointmentId: number) => {
    try {
      await appointmentService.updateStatus(appointmentId, 'reminded');
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, status: 'reminded' } : apt
      ));
    } catch (err) {
      console.error('Error sending reminder:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">MediRemind</h1>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Appointment
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <Calendar className="h-6 w-6 text-gray-400" />
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Today's Appointments</dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {appointments.filter(apt => 
                        new Date(apt.appointment_date).toDateString() === new Date().toDateString()
                      ).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <Bell className="h-6 w-6 text-gray-400" />
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Reminders</dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {appointments.filter(apt => apt.status === 'pending').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-gray-400" />
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Patients</dt>
                    <dd className="text-3xl font-semibold text-gray-900">
                      {new Set(appointments.map(apt => apt.patient_id)).size}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Appointments</h2>
          </div>
          <div className="border-t border-gray-200">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading appointments...</div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">{error}</div>
            ) : appointments.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No appointments found</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <li key={appointment.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {appointment.patient?.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patient?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(appointment.appointment_date), 'PPP p')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          appointment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : appointment.status === 'reminded'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                        <button 
                          onClick={() => handleSendReminder(appointment.id)}
                          disabled={appointment.status !== 'pending'}
                          className={`${
                            appointment.status === 'pending'
                              ? 'text-blue-600 hover:text-blue-700'
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <Bell className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      <NewAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAppointmentCreated={fetchAppointments}
      />
    </div>
  );
}

export default App;