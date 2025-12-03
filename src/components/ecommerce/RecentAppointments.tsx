import React from 'react';
import { usePagination } from '@/hooks/usePagination';
import Pagination from '@/components/tables/Pagination';

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  doctor: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
}

// Mock appointments data
const mockAppointments: Appointment[] = [
  {
    id: 'APT001',
    patientName: 'John Smith',
    patientId: '1',
    doctor: 'Dr. Benjamin Carter',
    date: '2024-02-15',
    time: '09:00 AM',
    type: 'Dental Cleaning',
    status: 'scheduled'
  },
  {
    id: 'APT002',
    patientName: 'Sarah Johnson',
    patientId: '2',
    doctor: 'Dr. Benjamin Carter',
    date: '2024-02-15',
    time: '10:30 AM',
    type: 'Root Canal',
    status: 'scheduled'
  },
  {
    id: 'APT003',
    patientName: 'Michael Brown',
    patientId: '3',
    doctor: 'Dr. Benjamin Carter',
    date: '2024-02-14',
    time: '02:00 PM',
    type: 'Crown Placement',
    status: 'completed'
  },
  {
    id: 'APT004',
    patientName: 'Emily Davis',
    patientId: '4',
    doctor: 'Dr. Benjamin Carter',
    date: '2024-02-14',
    time: '11:00 AM',
    type: 'Cavity Filling',
    status: 'completed'
  },
  {
    id: 'APT005',
    patientName: 'David Wilson',
    patientId: '5',
    doctor: 'Dr. Benjamin Carter',
    date: '2024-02-13',
    time: '03:30 PM',
    type: 'Consultation',
    status: 'no-show'
  },
  {
    id: 'APT006',
    patientName: 'Jessica Miller',
    patientId: '6',
    doctor: 'Dr. Benjamin Carter',
    date: '2024-02-13',
    time: '01:00 PM',
    type: 'Orthodontic Check',
    status: 'completed'
  },
  {
    id: 'APT007',
    patientName: 'Christopher Taylor',
    patientId: '7',
    doctor: 'Dr. Benjamin Carter',
    date: '2024-02-12',
    time: '10:00 AM',
    type: 'Implant Surgery',
    status: 'completed'
  },
  {
    id: 'APT008',
    patientName: 'Amanda Anderson',
    patientId: '8',
    doctor: 'Dr. Benjamin Carter',
    date: '2024-02-12',
    time: '04:00 PM',
    type: 'Teeth Whitening',
    status: 'cancelled'
  },
  {
    id: 'APT009',
    patientName: 'Robert Martinez',
    patientId: '9',
    doctor: 'Dr. Benjamin Carter',
    date: '2024-02-11',
    time: '09:30 AM',
    type: 'Denture Fitting',
    status: 'completed'
  },
  {
    id: 'APT010',
    patientName: 'Lisa Garcia',
    patientId: '10',
    doctor: 'Dr. Benjamin Carter',
    date: '2024-02-11',
    time: '02:30 PM',
    type: 'Veneer Consultation',
    status: 'completed'
  },
  {
    id: 'APT011',
    patientName: 'John Smith',
    patientId: '1',
    doctor: 'Dr. Benjamin Carter',
    date: '2024-02-16',
    time: '11:00 AM',
    type: 'Follow-up',
    status: 'scheduled'
  },
  {
    id: 'APT012',
    patientName: 'Sarah Johnson',
    patientId: '2',
    doctor: 'Dr. Benjamin Carter',
    date: '2024-02-16',
    time: '03:00 PM',
    type: 'Post-treatment Check',
    status: 'scheduled'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'no-show':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

export default function RecentAppointments() {
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData: displayedAppointments,
    goToPage,
    setItemsPerPage,
  } = usePagination({
    data: mockAppointments,
    initialItemsPerPage: 5,
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Appointments
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-sm">
                Patient
              </th>
              <th className="text-left py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-sm">
                Date & Time
              </th>
              <th className="text-left py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-sm">
                Treatment
              </th>
              <th className="text-left py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-sm">
                Doctor
              </th>
              <th className="text-left py-3 px-2 font-medium text-gray-600 dark:text-gray-400 text-sm">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedAppointments.map((appointment) => (
              <tr
                key={appointment.id}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="py-3 px-2">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {appointment.patientName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {appointment.patientId}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div>
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {new Date(appointment.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {appointment.time}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {appointment.type}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {appointment.doctor}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).replace('-', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {displayedAppointments.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No appointments found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={goToPage}
          onItemsPerPageChange={setItemsPerPage}
          showItemsPerPageSelect={true}
          showItemCount={false}
          pageSizeOptions={[5, 10, 15]}
        />
      )}
    </div>
  );
}