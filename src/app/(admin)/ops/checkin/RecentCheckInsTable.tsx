'use client';

import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { Clock, User, Calendar, Eye, Ticket, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { CheckIn, Priority } from '@/lib/domain';
import { useTodayCheckIns } from '@/lib/hooks/useCheckIns';
import { useCreateTicket } from '@/lib/hooks/useQueue';
import ComponentCard from '@/components/common/ComponentCard';

const columnHelper = createColumnHelper<CheckIn>();

interface RecentCheckInsTableProps {
  onViewPatient?: (patientId: string) => void;
  onCancelCheckIn?: (checkInId: string) => void;
}

export function RecentCheckInsTable({ 
  onViewPatient, 
  onCancelCheckIn 
}: RecentCheckInsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'checkInTime', desc: true } // Most recent first
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  
  const { data: checkIns = [], isLoading } = useTodayCheckIns();
  const createTicketMutation = useCreateTicket();

  const columns = useMemo(() => [
    columnHelper.accessor('checkInTime', {
      header: 'Time',
      cell: ({ getValue }) => {
        const date = new Date(getValue());
        return (
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="font-medium">
              {date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        );
      },
    }),
    
    columnHelper.accessor(
      (row) => row.patient ? 
        `${row.patient.firstName} ${row.patient.lastName}` : 
        `${row.walkInPatient?.firstName} ${row.walkInPatient?.lastName}`,
      {
        id: 'patient',
        header: 'Patient',
        cell: ({ getValue, row }) => {
          const patient = row.original.patient || row.original.walkInPatient;
          return (
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {row.original.isWalkIn ? (
                  <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-orange-600" />
                  </div>
                ) : (
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900">{getValue()}</div>
                <div className="text-sm text-gray-500">
                  {patient?.phoneNumber}
                  {row.original.isWalkIn && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                      Walk-in
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        },
      }
    ),

    columnHelper.accessor('priority', {
      header: 'Priority',
      cell: ({ getValue }) => {
        const priority = getValue();
        const colors = {
          [Priority.EMERGENCY]: 'bg-red-100 text-red-800 border-red-200',
          [Priority.URGENT]: 'bg-orange-100 text-orange-800 border-orange-200',
          [Priority.HIGH]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          [Priority.NORMAL]: 'bg-green-100 text-green-800 border-green-200',
          [Priority.LOW]: 'bg-gray-100 text-gray-800 border-gray-200',
        };
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[priority]}`}>
            {priority.toLowerCase()}
          </span>
        );
      },
    }),

    columnHelper.accessor('linkedAppointmentId', {
      header: 'Appointment',
      cell: ({ getValue }) => {
        const appointmentId = getValue();
        if (appointmentId) {
          return (
            <div className="flex items-center space-x-1 text-green-600">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Linked</span>
            </div>
          );
        }
        return (
          <span className="text-sm text-gray-500">None</span>
        );
      },
    }),

    columnHelper.accessor('reasonForVisit', {
      header: 'Reason',
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-900 max-w-xs truncate">
          {getValue()}
        </span>
      ),
    }),

    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue();
        const colors = {
          'checked_in': 'bg-blue-100 text-blue-800',
          'in_progress': 'bg-yellow-100 text-yellow-800',
          'scheduled': 'bg-gray-100 text-gray-800',
          'completed': 'bg-green-100 text-green-800',
          'cancelled': 'bg-red-100 text-red-800',
          'no_show': 'bg-red-100 text-red-800',
        };
        
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
            {status.replace('_', ' ')}
          </span>
        );
      },
    }),

    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const checkIn = row.original;
        const patientId = checkIn.patient?.id || checkIn.walkInPatient?.id;
        
        return (
          <div className="flex items-center justify-end space-x-1">
            {/* View Patient */}
            <button
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
              onClick={() => patientId && onViewPatient?.(patientId)}
              title="View patient details"
            >
              <Eye className="h-4 w-4" />
            </button>

            {/* Create Ticket */}
            {checkIn.status === 'checked_in' && (
              <button
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                onClick={() => handleCreateTicket(checkIn)}
                title="Add to queue"
              >
                <Ticket className="h-4 w-4" />
              </button>
            )}

            {/* Cancel Check-in */}
            {['checked_in', 'in_progress'].includes(checkIn.status) && (
              <button
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                onClick={() => handleCancelCheckIn(checkIn.id)}
                title="Cancel check-in"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      },
    }),
  ], [onViewPatient]);

  const table = useReactTable({
    data: checkIns,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleCreateTicket = async (checkIn: CheckIn) => {
    try {
      await createTicketMutation.mutateAsync({
        checkInId: checkIn.id,
        procedureId: '', // Would need to determine procedure from check-in
        priority: checkIn.priority,
        estimatedDuration: 30, // Default duration
      });
      
      toast.success(`✅ Added ${checkIn.patient?.firstName || checkIn.walkInPatient?.firstName} to queue`);
    } catch (error) {
      toast.error('❌ Failed to add patient to queue');
    }
  };

  const handleCancelCheckIn = async (checkInId: string) => {
    try {
      await onCancelCheckIn?.(checkInId);
      toast.success('✅ Check-in cancelled');
    } catch (error) {
      toast.error('❌ Failed to cancel check-in');
    }
  };

  if (isLoading) {
    return (
      <ComponentCard title="Recent Check-ins" className="h-96">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Recent Check-ins">
      <div className="space-y-4">
        
        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search patients..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-sm text-gray-600">
            {table.getFilteredRowModel().rows.length} check-ins today
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center space-x-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() && (
                          <span>
                            {header.column.getIsSorted() === 'desc' ? ' ↓' : ' ↑'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr 
                  key={row.id} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {table.getFilteredRowModel().rows.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No check-ins found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {globalFilter 
                ? "Try adjusting your search terms." 
                : "No patients have checked in today."
              }
            </p>
          </div>
        )}
      </div>
    </ComponentCard>
  );
}