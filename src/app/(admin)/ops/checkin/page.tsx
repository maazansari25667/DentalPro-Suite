'use client';

import { useRouter } from 'next/navigation';
import { CheckInForm } from './CheckInForm';
import { RecentCheckInsTable } from './RecentCheckInsTable';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';

export default function CheckInPage() {
  const router = useRouter();

  const handleViewPatient = (patientId: string) => {
    // Navigate to patient details page
    router.push(`/ops/patients/${patientId}`);
  };

  const handleCancelCheckIn = async (checkInId: string) => {
    // In a real app, this would call an API to cancel the check-in
    console.log('Cancelling check-in:', checkInId);
    // The mutation would be handled by a hook like useCancelCheckIn
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBreadCrumb pageTitle="Check-in Desk" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-8">
          
          {/* Page Header */}
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
                Check-in Desk
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Check in patients and manage today&apos;s arrivals
              </p>
            </div>
          </div>

          {/* Check-in Form */}
          <CheckInForm />

          {/* Recent Check-ins Table */}
          <RecentCheckInsTable 
            onViewPatient={handleViewPatient}
            onCancelCheckIn={handleCancelCheckIn}
          />
        </div>
      </div>
    </div>
  );
}