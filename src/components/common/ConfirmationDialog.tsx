'use client';

import React, { useState } from 'react';
import { AlertTriangle, HelpCircle, Info, CheckCircle, X } from 'lucide-react';
import Button from '@/components/ui/button/Button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  isLoading = false,
}: ConfirmationDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return <HelpCircle className="h-6 w-6 text-blue-500" />;
    }
  };

  const getButtonVariant = (): "outline" | "primary" | undefined => {
    switch (type) {
      case 'danger':
        return 'primary'; // Use primary for destructive actions
      case 'warning':
        return 'outline';
      case 'success':
        return 'primary';
      default:
        return 'primary';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full animate-scaleIn">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {getIcon()}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-300">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={isProcessing || isLoading}
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              variant={getButtonVariant()}
              className="flex-1"
              disabled={isProcessing || isLoading}
            >
              {isProcessing || isLoading ? 'Processing...' : confirmText}
            </Button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0; 
            transform: scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
}

// Hook for easier confirmation dialog management
export function useConfirmationDialog() {
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    type?: 'danger' | 'warning' | 'info' | 'success';
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showConfirmation = (options: {
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    type?: 'danger' | 'warning' | 'info' | 'success';
    confirmText?: string;
    cancelText?: string;
  }) => {
    setDialog({
      isOpen: true,
      ...options,
    });
  };

  const hideConfirmation = () => {
    setDialog(prev => ({ ...prev, isOpen: false }));
  };

  const confirmationDialog = (
    <ConfirmationDialog
      {...dialog}
      onClose={hideConfirmation}
    />
  );

  return {
    showConfirmation,
    hideConfirmation,
    confirmationDialog,
  };
}

// Preset confirmation dialogs for common actions
export function useCommonConfirmations() {
  const { showConfirmation, confirmationDialog } = useConfirmationDialog();

  const confirmDelete = (itemName: string, onConfirm: () => void | Promise<void>) => {
    showConfirmation({
      title: 'Delete Item',
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm,
    });
  };

  const confirmCancel = (onConfirm: () => void | Promise<void>) => {
    showConfirmation({
      title: 'Cancel Changes',
      message: 'Are you sure you want to cancel? Any unsaved changes will be lost.',
      type: 'warning',
      confirmText: 'Cancel Changes',
      onConfirm,
    });
  };

  const confirmLogout = (onConfirm: () => void | Promise<void>) => {
    showConfirmation({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      type: 'info',
      confirmText: 'Sign Out',
      onConfirm,
    });
  };

  const confirmSave = (onConfirm: () => void | Promise<void>) => {
    showConfirmation({
      title: 'Save Changes',
      message: 'Are you sure you want to save these changes?',
      type: 'success',
      confirmText: 'Save',
      onConfirm,
    });
  };

  return {
    confirmDelete,
    confirmCancel,
    confirmLogout,
    confirmSave,
    confirmationDialog,
  };
}