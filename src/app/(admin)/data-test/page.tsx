'use client';

import { useDentists, useRooms, useProcedures, useTodayAppointments, useTodayCheckIns, useQueue } from '@/lib/hooks';

export default function DataTestPage() {
  const { data: dentists, isLoading: dentistsLoading, error: dentistsError } = useDentists();
  const { data: rooms, isLoading: roomsLoading, error: roomsError } = useRooms();
  const { data: procedures, isLoading: proceduresLoading, error: proceduresError } = useProcedures();
  const { data: appointments, isLoading: appointmentsLoading, error: appointmentsError } = useTodayAppointments();
  const { data: checkIns, isLoading: checkInsLoading, error: checkInsError } = useTodayCheckIns();
  const { data: queue, isLoading: queueLoading, error: queueError } = useQueue();

  const isLoading = dentistsLoading || roomsLoading || proceduresLoading || appointmentsLoading || checkInsLoading || queueLoading;
  const hasError = dentistsError || roomsError || proceduresError || appointmentsError || checkInsError || queueError;

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">WavenetCare Data Test</h1>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>Loading data...</span>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Data Load Error</h1>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p>Failed to load data. Please check the console for details.</p>
          {dentistsError && <p>Dentists Error: {(dentistsError as Error).message}</p>}
          {roomsError && <p>Rooms Error: {(roomsError as Error).message}</p>}
          {proceduresError && <p>Procedures Error: {(proceduresError as Error).message}</p>}
          {appointmentsError && <p>Appointments Error: {(appointmentsError as Error).message}</p>}
          {checkInsError && <p>Check-ins Error: {(checkInsError as Error).message}</p>}
          {queueError && <p>Queue Error: {(queueError as Error).message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-green-600">✅ WavenetCare Data Successfully Loaded!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Summary Cards */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800">👨‍⚕️ Dentists</h3>
          <p className="text-2xl font-bold text-blue-600">{dentists?.length || 0}</p>
          <p className="text-sm text-blue-600">Active dental specialists</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800">🏥 Rooms</h3>
          <p className="text-2xl font-bold text-green-600">{rooms?.length || 0}</p>
          <p className="text-sm text-green-600">Treatment rooms</p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800">🦷 Procedures</h3>
          <p className="text-2xl font-bold text-purple-600">{procedures?.length || 0}</p>
          <p className="text-sm text-purple-600">Dental services</p>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-800">📅 Today's Appointments</h3>
          <p className="text-2xl font-bold text-orange-600">{appointments?.length || 0}</p>
          <p className="text-sm text-orange-600">Scheduled today</p>
        </div>
        
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
          <h3 className="font-semibold text-cyan-800">✅ Check-ins</h3>
          <p className="text-2xl font-bold text-cyan-600">{checkIns?.length || 0}</p>
          <p className="text-sm text-cyan-600">Patients checked in</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800">🎫 Queue</h3>
          <p className="text-2xl font-bold text-red-600">{queue?.length || 0}</p>
          <p className="text-sm text-red-600">Tickets in queue</p>
        </div>
      </div>

      {/* Detailed Data */}
      <div className="space-y-6">
        
        {/* Dentists */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3">👨‍⚕️ Dentists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dentists?.map(dentist => (
              <div key={dentist.id} className="border rounded p-3 bg-gray-50">
                <p className="font-medium">{dentist.firstName} {dentist.lastName}</p>
                <p className="text-sm text-gray-600">{dentist.specialization}</p>
                <p className="text-xs text-gray-500">{dentist.email}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Queue */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3">🎫 Current Queue</h2>
          {queue?.length ? (
            <div className="space-y-2">
              {queue.map(ticket => (
                <div key={ticket.id} className="border rounded p-3 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{ticket.patient.firstName} {ticket.patient.lastName}</p>
                      <p className="text-sm text-gray-600">Ticket: {ticket.ticketNumber}</p>
                      <p className="text-xs text-gray-500">Status: {ticket.status} | Priority: {ticket.priority}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        ticket.priority === 'emergency' ? 'bg-red-100 text-red-800' :
                        ticket.priority === 'urgent' ? 'bg-orange-100 text-orange-800' :
                        ticket.priority === 'high' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                  {ticket.dentist && (
                    <p className="text-xs text-blue-600 mt-1">
                      👨‍⚕️ {ticket.dentist.firstName} {ticket.dentist.lastName}
                    </p>
                  )}
                  {ticket.room && (
                    <p className="text-xs text-green-600 mt-1">
                      🏥 {ticket.room.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No tickets in queue</p>
          )}
        </div>

        {/* MSW Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3 text-green-800">🔶 MSW Status</h2>
          <p className="text-green-700">Mock Service Worker is active and serving data!</p>
          <p className="text-sm text-green-600 mt-2">
            The mock socket will automatically create new check-ins and update queue every 15-30 seconds.
            Check the browser console for live updates.
          </p>
        </div>
      </div>
    </div>
  );
}