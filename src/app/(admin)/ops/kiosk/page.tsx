'use client';

import React, { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';
import { useCreateCheckIn } from '@/lib/hooks/useCheckIns';
import { useCreateTicket, useQueue } from '@/lib/hooks/useQueue';
import { CreateCheckInRequest, CreateQueueTicketRequest, Priority } from '@/lib/domain';
import { User, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface KioskFormData {
  mrn: string;
  phone: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  reasonForVisit: string;
  hasConsent: boolean;
}

interface TicketResult {
  ticketNumber: string;
  estimatedWaitTime: string;
  checkInId: string;
}

export default function KioskPage() {
  const [formData, setFormData] = useState<KioskFormData>({
    mrn: '',
    phone: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    reasonForVisit: '',
    hasConsent: false,
  });
  
  const [currentStep, setCurrentStep] = useState<'form' | 'processing' | 'success' | 'error'>('form');
  const [ticketResult, setTicketResult] = useState<TicketResult | null>(null);
  const [error, setError] = useState<string>('');
  const [highContrast, setHighContrast] = useState(false);
  
  const createCheckIn = useCreateCheckIn();
  const createTicket = useCreateTicket();
  const { data: queueData } = useQueue();

  // Focus management refs
  const formRef = useRef<HTMLFormElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus trap for accessibility
  useEffect(() => {
    if (currentStep === 'form' && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [currentStep]);

  // High contrast toggle (Ctrl+Alt+C)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key === 'c') {
        setHighContrast(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Mask MRN input (show only last 4 digits)
  const maskMRN = (value: string) => {
    if (value.length <= 4) return value;
    return '*'.repeat(value.length - 4) + value.slice(-4);
  };

  // Mask phone input (show only last 4 digits)
  const maskPhone = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 4) return digitsOnly;
    return '*'.repeat(digitsOnly.length - 4) + digitsOnly.slice(-4);
  };

  const handleInputChange = (field: keyof KioskFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.hasConsent) {
      setError('Please provide consent to proceed');
      return;
    }

    setCurrentStep('processing');
    setError('');

    try {
      // Create check-in
      const checkInRequest: CreateCheckInRequest = {
        walkInPatient: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: 'Unknown' as any, // Will need to add gender to form
        },
        priority: Priority.NORMAL,
        reasonForVisit: formData.reasonForVisit || 'General checkup',
        isWalkIn: true,
      };

      const checkIn = await createCheckIn.mutateAsync(checkInRequest);

      // Create queue ticket
      const ticketRequest: CreateQueueTicketRequest = {
        checkInId: checkIn.id,
        procedureId: 'procedure-routine',
        priority: Priority.NORMAL,
        estimatedDuration: 30,
      };

      const ticket = await createTicket.mutateAsync(ticketRequest);

      // Calculate ETA
      const queuePosition = queueData?.filter((t: any) => 
        t.status === 'waiting' && 
        new Date(t.createdAt) < new Date(ticket.createdAt)
      ).length || 0;
      
      const estimatedWaitTime = Math.max(15, queuePosition * 20);

      setTicketResult({
        ticketNumber: ticket.ticketNumber,
        estimatedWaitTime: `${estimatedWaitTime} minutes`,
        checkInId: checkIn.id,
      });

      setCurrentStep('success');
    } catch (err) {
      console.error('Kiosk check-in failed:', err);
      setError('Unable to complete check-in. Please see reception for assistance.');
      setCurrentStep('error');
    }
  };

  const resetForm = () => {
    setFormData({
      mrn: '',
      phone: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      reasonForVisit: '',
      hasConsent: false,
    });
    setCurrentStep('form');
    setTicketResult(null);
    setError('');
  };

  const containerClasses = `min-h-screen flex items-center justify-center p-4 ${
    highContrast 
      ? 'bg-black text-white' 
      : 'bg-gradient-to-br from-blue-50 to-white'
  }`;

  if (currentStep === 'success' && ticketResult) {
    return (
      <SuccessScreen 
        ticketResult={ticketResult} 
        onStartOver={resetForm}
        highContrast={highContrast}
      />
    );
  }

  if (currentStep === 'error') {
    return (
      <ErrorScreen 
        error={error}
        onTryAgain={() => setCurrentStep('form')}
        onStartOver={resetForm}
        highContrast={highContrast}
      />
    );
  }

  return (
    <div className={containerClasses}>
      <div className="w-full max-w-2xl" role="main" aria-label="Self check-in form">
        {/* High Contrast Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`px-4 py-2 rounded-lg border-2 font-medium focus:outline-none focus:ring-4 ${
              highContrast
                ? 'bg-white text-black border-white focus:ring-white'
                : 'bg-white text-gray-900 border-gray-300 focus:ring-blue-500'
            }`}
            aria-label="Toggle high contrast mode"
          >
            {highContrast ? 'Normal View' : 'High Contrast'}
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
            highContrast ? 'bg-white text-black' : 'bg-blue-100 text-blue-600'
          }`}>
            <User className="w-10 h-10" aria-hidden="true" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Self Check-In</h1>
          <p className="text-xl opacity-90">Please enter your information to check in</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8" role="progressbar" aria-valuenow={1} aria-valuemax={3} aria-label="Check-in progress: step 1 of 3">
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${
              currentStep === 'form' 
                ? (highContrast ? 'bg-white' : 'bg-blue-600') 
                : (highContrast ? 'bg-gray-600' : 'bg-gray-300')
            }`} aria-label="Step 1: Information" />
            <div className={`w-12 h-0.5 ${highContrast ? 'bg-gray-600' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${
              currentStep === 'processing' 
                ? (highContrast ? 'bg-white' : 'bg-blue-600') 
                : (highContrast ? 'bg-gray-600' : 'bg-gray-300')
            }`} aria-label="Step 2: Processing" />
            <div className={`w-12 h-0.5 ${highContrast ? 'bg-gray-600' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${
              currentStep === 'success' 
                ? (highContrast ? 'bg-white' : 'bg-green-600') 
                : (highContrast ? 'bg-gray-600' : 'bg-gray-300')
            }`} aria-label="Step 3: Complete" />
          </div>
        </div>

        {/* Form */}
        <form 
          ref={formRef}
          onSubmit={handleSubmit} 
          className={`rounded-xl shadow-xl p-8 space-y-8 ${
            highContrast 
              ? 'bg-gray-900 border-2 border-white' 
              : 'bg-white'
          }`}
        >
          {/* Patient Lookup */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Patient Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="mrn" className="text-lg font-medium">Medical Record Number</Label>
                <input
                  ref={firstInputRef}
                  id="mrn"
                  type="text"
                  value={maskMRN(formData.mrn)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('mrn', e.target.value.replace(/\*/g, ''))}
                  className={`text-xl h-14 mt-2 focus:ring-4 rounded-lg border w-full px-4 py-2 ${
                    highContrast 
                      ? 'bg-black text-white border-white focus:ring-white focus:border-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter MRN"
                  aria-describedby="mrn-help"
                  required
                />
                <p id="mrn-help" className="text-sm opacity-75 mt-1">
                  Your medical record number for verification
                </p>
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-lg font-medium">Phone Number</Label>
                <input
                  id="phone"
                  type="tel"
                  value={maskPhone(formData.phone)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value.replace(/\*/g, ''))}
                  className={`text-xl h-14 mt-2 focus:ring-4 rounded-lg border w-full px-4 py-2 ${
                    highContrast 
                      ? 'bg-black text-white border-white focus:ring-white focus:border-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter phone"
                  aria-describedby="phone-help"
                  required
                />
                <p id="phone-help" className="text-sm opacity-75 mt-1">
                  Phone number on file for verification
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName" className="text-lg font-medium">First Name</Label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('firstName', e.target.value)}
                  className={`text-xl h-14 mt-2 focus:ring-4 rounded-lg border w-full px-4 py-2 ${
                    highContrast 
                      ? 'bg-black text-white border-white focus:ring-white focus:border-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="First name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="lastName" className="text-lg font-medium">Last Name</Label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('lastName', e.target.value)}
                  className={`text-xl h-14 mt-2 focus:ring-4 rounded-lg border w-full px-4 py-2 ${
                    highContrast 
                      ? 'bg-black text-white border-white focus:ring-white focus:border-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dateOfBirth" className="text-lg font-medium">Date of Birth</Label>
              <input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('dateOfBirth', e.target.value)}
                className={`text-xl h-14 mt-2 focus:ring-4 rounded-lg border w-full px-4 py-2 ${
                  highContrast 
                    ? 'bg-black text-white border-white focus:ring-white focus:border-white' 
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                }`}
                required
              />
            </div>
          </div>

          {/* Consent */}
          <div className="border-t pt-6">
            <div className="flex items-start space-x-4">
              <input
                type="checkbox"
                id="consent"
                checked={formData.hasConsent}
                onChange={(e) => handleInputChange('hasConsent', e.target.checked)}
                className={`mt-1 h-6 w-6 rounded focus:ring-4 ${
                  highContrast
                    ? 'text-white bg-black border-white focus:ring-white'
                    : 'text-blue-600 border-gray-300 focus:ring-blue-500'
                }`}
                aria-describedby="consent-text"
                required
              />
              <label htmlFor="consent" id="consent-text" className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                I consent to treatment and acknowledge that I have reviewed and updated my personal information. 
                I understand the clinic&apos;s privacy practices and consent to the use of my health information for treatment purposes.
              </label>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div 
              className={`border rounded-lg p-4 flex items-center space-x-3 ${
                highContrast 
                  ? 'bg-red-900 border-red-300 text-red-100'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={currentStep === 'processing' || !formData.hasConsent}
            className={`w-full h-16 text-xl font-semibold rounded-lg focus:ring-4 disabled:opacity-50 transition-colors ${
              highContrast
                ? 'bg-white text-black hover:bg-gray-200 focus:ring-white border-2 border-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
            }`}
          >
            {currentStep === 'processing' ? (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
                <span>Processing Check-In...</span>
              </div>
            ) : (
              'Complete Check-In'
            )}
          </button>
        </form>

        {/* Help Text */}
        <div className="text-center mt-8">
          <p className="opacity-75">
            Need assistance? Please visit the reception desk or call (555) 123-4567
          </p>
          <p className="text-sm opacity-60 mt-2">
            Press Ctrl+Alt+C for high contrast mode
          </p>
        </div>
      </div>
    </div>
  );
}

// Success Screen Component
function SuccessScreen({ 
  ticketResult, 
  onStartOver,
  highContrast 
}: { 
  ticketResult: TicketResult;
  onStartOver: () => void;
  highContrast: boolean;
}) {
  const [currentStatus, setCurrentStatus] = useState<string>('checked-in');
  
  // Poll for status updates
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/queue?checkInId=${ticketResult.checkInId}`);
        if (response.ok) {
          const data = await response.json();
          const ticket = data.data.find((t: any) => t.checkInId === ticketResult.checkInId);
          if (ticket) {
            setCurrentStatus(ticket.status);
          }
        }
      } catch (error) {
        console.error('Failed to poll status:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [ticketResult.checkInId]);

  const getStatusDisplay = () => {
    switch (currentStatus) {
      case 'waiting':
        return { icon: Clock, text: 'In Queue', color: highContrast ? 'text-white' : 'text-blue-600' };
      case 'in_progress':
        return { icon: User, text: 'Being Seen', color: highContrast ? 'text-white' : 'text-green-600' };
      case 'completed':
        return { icon: CheckCircle, text: 'Complete', color: highContrast ? 'text-white' : 'text-green-600' };
      default:
        return { icon: Clock, text: 'Checked In', color: highContrast ? 'text-white' : 'text-blue-600' };
    }
  };

  const status = getStatusDisplay();
  const StatusIcon = status.icon;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      highContrast 
        ? 'bg-black text-white' 
        : 'bg-gradient-to-br from-green-50 to-white'
    }`}>
      <div className="w-full max-w-2xl text-center">
        {/* Success Icon */}
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-8 ${
          highContrast ? 'bg-white text-black' : 'bg-green-100 text-green-600'
        }`}>
          <CheckCircle className="w-12 h-12" />
        </div>

        <h1 className="text-4xl font-bold mb-4">Check-In Complete!</h1>
        
        {/* Ticket Information */}
        <div className={`rounded-xl shadow-xl p-8 mb-8 ${
          highContrast 
            ? 'bg-gray-900 border-2 border-white' 
            : 'bg-white'
        }`}>
          <div className="space-y-6">
            <div>
              <p className="text-lg opacity-75 mb-2">Your Ticket Number</p>
              <p className={`text-6xl font-bold ${
                highContrast ? 'text-white' : 'text-blue-600'
              }`}>{ticketResult.ticketNumber}</p>
            </div>
            
            <div className="border-t pt-6">
              <p className="text-lg opacity-75 mb-2">Estimated Wait Time</p>
              <p className="text-3xl font-semibold">{ticketResult.estimatedWaitTime}</p>
            </div>

            <div className="border-t pt-6">
              <p className="text-lg opacity-75 mb-2">Current Status</p>
              <div className="flex items-center justify-center space-x-3">
                <StatusIcon className={`w-8 h-8 ${status.color}`} />
                <p className={`text-2xl font-semibold ${status.color}`}>{status.text}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className={`rounded-lg p-6 mb-8 ${
          highContrast ? 'bg-gray-800 border border-white' : 'bg-blue-50'
        }`}>
          <h3 className="text-xl font-semibold mb-3">What&apos;s Next?</h3>
          <ul className="space-y-2 text-left max-w-md mx-auto opacity-90">
            <li>• Please take a seat in the waiting area</li>
            <li>• Listen for your ticket number to be called</li>
            <li>• Your status will update automatically on this screen</li>
            <li>• Estimated times may vary based on current queue</li>
          </ul>
        </div>

        <Button
          onClick={onStartOver}
          variant="outline"
          className={`h-12 px-8 text-lg focus:ring-4 ${
            highContrast
              ? 'border-white text-white hover:bg-white hover:text-black focus:ring-white'
              : 'focus:ring-blue-500'
          }`}
        >
          Check In Another Patient
        </Button>
      </div>
    </div>
  );
}

// Error Screen Component
function ErrorScreen({ 
  error, 
  onTryAgain, 
  onStartOver,
  highContrast 
}: { 
  error: string;
  onTryAgain: () => void;
  onStartOver: () => void;
  highContrast: boolean;
}) {
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      highContrast 
        ? 'bg-black text-white' 
        : 'bg-gradient-to-br from-red-50 to-white'
    }`}>
      <div className="w-full max-w-2xl text-center">
        {/* Error Icon */}
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-8 ${
          highContrast ? 'bg-white text-black' : 'bg-red-100 text-red-600'
        }`}>
          <AlertCircle className="w-12 h-12" />
        </div>

        <h1 className="text-4xl font-bold mb-4">Check-In Failed</h1>
        
        <div className={`rounded-xl shadow-xl p-8 mb-8 ${
          highContrast 
            ? 'bg-gray-900 border-2 border-white' 
            : 'bg-white'
        }`}>
          <p className="text-xl mb-6 opacity-90">{error}</p>
          
          <div className="space-y-4">
            <Button
              onClick={onTryAgain}
              className={`w-full h-12 text-lg focus:ring-4 ${
                highContrast
                  ? 'bg-white text-black hover:bg-gray-200 focus:ring-white'
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              }`}
            >
              Try Again
            </Button>
            
            <Button
              onClick={onStartOver}
              variant="outline"
              className={`w-full h-12 text-lg focus:ring-4 ${
                highContrast
                  ? 'border-white text-white hover:bg-white hover:text-black focus:ring-white'
                  : 'focus:ring-blue-500'
              }`}
            >
              Start Over
            </Button>
          </div>
        </div>

        <div className={`rounded-lg p-6 ${
          highContrast ? 'bg-gray-800 border border-white' : 'bg-yellow-50'
        }`}>
          <h3 className="text-xl font-semibold mb-3">Need Help?</h3>
          <p className="opacity-90">
            Please visit the reception desk for assistance with your check-in.
          </p>
        </div>
      </div>
    </div>
  );
}