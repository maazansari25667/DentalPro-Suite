'use client';

import { useState, useMemo } from 'react';
import { usePatients } from '@/context/PatientContext';
import { usePagination } from '@/hooks/usePagination';
import Link from 'next/link';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Pagination from '@/components/tables/Pagination';

export default function PatientsPage() {
  const { patients, searchPatients, deletePatient } = usePatients();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter patients based on search query
  const filteredPatients = useMemo(() => {
    if (searchQuery.trim() === '') {
      return patients;
    }
    return searchPatients(searchQuery);
  }, [patients, searchPatients, searchQuery]);

  // Use pagination hook
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData: displayedPatients,
    goToPage,
    setItemsPerPage,
  } = usePagination({
    data: filteredPatients,
    initialItemsPerPage: 10,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Reset to first page when searching
    goToPage(1);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete patient ${name}?`)) {
      deletePatient(id);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Dental Patients" />
      
      <ComponentCard title="Dental Patient Management">
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex-1 max-w-md">
              <Label htmlFor="search">Search Dental Patients</Label>
              <Input
                id="search"
                type="text"
                placeholder="Search by name, email, or phone..."
                defaultValue={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Link href="/patients/add">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Add New Patient
                </Button>
              </Link>
            </div>
          </div>

          {/* Patients Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    Patient
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    Contact
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    Age/Gender
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    Last Visit
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    Next Appointment
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {patient.id}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {patient.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {patient.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {calculateAge(patient.dateOfBirth)} years
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {patient.gender}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {patient.nextAppointment ? new Date(patient.nextAppointment).toLocaleDateString() : 'None'}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center space-x-2">
                        <Link href={`/patients/${patient.id}`}>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            View
                          </Button>
                        </Link>
                        <Link href={`/patients/${patient.id}/edit`}>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Edit
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          onClick={() => handleDelete(patient.id, `${patient.firstName} ${patient.lastName}`)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {displayedPatients.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No patients found matching your search.' : 'No patients found.'}
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
              showItemCount={true}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          )}
        </div>
      </ComponentCard>
    </div>
  );
}