'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePatients } from '@/context/PatientContext';
import Link from 'next/link';
import Button from '@/components/ui/button/Button';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';

export default function ViewPatientPage() {
  const params = useParams();
  const router = useRouter();
  const { getPatient, deletePatient } = usePatients();
  
  const patientId = params?.id as string;
  const patient = getPatient(patientId);

  if (!patient) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Patient Not Found" />
        <ComponentCard title="Dental Patient Information">
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The patient you are looking for could not be found.
            </p>
            <Link href="/patients">
              <Button>Back to Patients</Button>
            </Link>
          </div>
        </ComponentCard>
      </div>
    );
  }

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

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete patient ${patient.firstName} ${patient.lastName}?`)) {
      deletePatient(patient.id);
      router.push('/patients');
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle={`${patient.firstName} ${patient.lastName}`} />
      
      {/* Header Actions */}
      <div className="flex justify-end space-x-3">
        <Link href={`/patients/${patient.id}/edit`}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Edit Patient
          </Button>
        </Link>
        <Button 
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700"
        >
          Delete Patient
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Patient Information */}
        <div className="xl:col-span-2 space-y-6">
          {/* Personal Information */}
          <ComponentCard title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Full Name
                </h4>
                <p className="text-gray-900 dark:text-gray-100">
                  {patient.firstName} {patient.lastName}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Patient ID
                </h4>
                <p className="text-gray-900 dark:text-gray-100">{patient.id}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Email
                </h4>
                <p className="text-gray-900 dark:text-gray-100">{patient.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Phone
                </h4>
                <p className="text-gray-900 dark:text-gray-100">{patient.phone}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Date of Birth
                </h4>
                <p className="text-gray-900 dark:text-gray-100">
                  {new Date(patient.dateOfBirth).toLocaleDateString()} 
                  <span className="text-gray-600 dark:text-gray-400 ml-2">
                    ({calculateAge(patient.dateOfBirth)} years old)
                  </span>
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Gender
                </h4>
                <p className="text-gray-900 dark:text-gray-100">{patient.gender}</p>
              </div>
            </div>
          </ComponentCard>

          {/* Address Information */}
          <ComponentCard title="Address">
            <div>
              <p className="text-gray-900 dark:text-gray-100">
                {patient.address.street}
              </p>
              <p className="text-gray-900 dark:text-gray-100">
                {patient.address.city}, {patient.address.state} {patient.address.zipCode}
              </p>
              <p className="text-gray-900 dark:text-gray-100">
                {patient.address.country}
              </p>
            </div>
          </ComponentCard>

          {/* Emergency Contact */}
          <ComponentCard title="Emergency Contact">
            {patient.emergencyContact.name ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Name
                  </h4>
                  <p className="text-gray-900 dark:text-gray-100">
                    {patient.emergencyContact.name}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Relationship
                  </h4>
                  <p className="text-gray-900 dark:text-gray-100">
                    {patient.emergencyContact.relationship}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Phone
                  </h4>
                  <p className="text-gray-900 dark:text-gray-100">
                    {patient.emergencyContact.phone}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No emergency contact information available
              </p>
            )}
          </ComponentCard>

          {/* Insurance Information */}
          <ComponentCard title="Insurance Information">
            {patient.insuranceInfo.provider ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Provider
                  </h4>
                  <p className="text-gray-900 dark:text-gray-100">
                    {patient.insuranceInfo.provider}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Policy Number
                  </h4>
                  <p className="text-gray-900 dark:text-gray-100">
                    {patient.insuranceInfo.policyNumber}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No insurance information available
              </p>
            )}
          </ComponentCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <ComponentCard title="Medical Summary">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Blood Type
                </h4>
                <p className="text-gray-900 dark:text-gray-100">
                  {patient.bloodType || 'Not specified'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Height
                </h4>
                <p className="text-gray-900 dark:text-gray-100">
                  {patient.height ? `${patient.height} cm` : 'Not specified'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Weight
                </h4>
                <p className="text-gray-900 dark:text-gray-100">
                  {patient.weight ? `${patient.weight} kg` : 'Not specified'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Last Visit
                </h4>
                <p className="text-gray-900 dark:text-gray-100">
                  {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Next Appointment
                </h4>
                <p className="text-gray-900 dark:text-gray-100">
                  {patient.nextAppointment ? new Date(patient.nextAppointment).toLocaleDateString() : 'None scheduled'}
                </p>
              </div>
            </div>
          </ComponentCard>

          {/* Medical History */}
          <ComponentCard title="Medical History">
            {patient.medicalHistory.length > 0 ? (
              <ul className="space-y-2">
                {patient.medicalHistory.map((condition, index) => (
                  <li key={index} className="text-gray-900 dark:text-gray-100">
                    • {condition}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No medical history recorded
              </p>
            )}
          </ComponentCard>

          {/* Allergies */}
          <ComponentCard title="Allergies">
            {patient.allergies.length > 0 ? (
              <ul className="space-y-2">
                {patient.allergies.map((allergy, index) => (
                  <li key={index} className="text-red-600 dark:text-red-400">
                    • {allergy}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No known allergies
              </p>
            )}
          </ComponentCard>

          {/* Current Medications */}
          <ComponentCard title="Current Medications">
            {patient.currentMedications.length > 0 ? (
              <ul className="space-y-2">
                {patient.currentMedications.map((medication, index) => (
                  <li key={index} className="text-gray-900 dark:text-gray-100">
                    • {medication}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No current medications
              </p>
            )}
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}