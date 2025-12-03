'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Users, Calendar, Clock, Plus, LayoutGrid, Zap, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'navigation' | 'actions' | 'search' | 'settings';
  keywords: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      title: 'Dashboard',
      subtitle: 'View overview and metrics',
      icon: <LayoutGrid className="h-4 w-4" />,
      action: () => router.push('/dashboard'),
      category: 'navigation',
      keywords: ['dashboard', 'home', 'overview', 'metrics'],
    },
    {
      id: 'nav-checkin',
      title: 'Check-in Desk',
      subtitle: 'Patient check-in interface',
      icon: <Users className="h-4 w-4" />,
      action: () => router.push('/ops/checkin'),
      category: 'navigation',
      keywords: ['checkin', 'check-in', 'reception', 'desk'],
    },
    {
      id: 'nav-queue',
      title: 'Queue Board',
      subtitle: 'Manage patient queue',
      icon: <Clock className="h-4 w-4" />,
      action: () => router.push('/ops/queue'),
      category: 'navigation',
      keywords: ['queue', 'board', 'waiting', 'tickets'],
    },
    {
      id: 'nav-kiosk',
      title: 'Self-Service Kiosk',
      subtitle: 'Patient self check-in',
      icon: <Users className="h-4 w-4" />,
      action: () => router.push('/ops/kiosk'),
      category: 'navigation',
      keywords: ['kiosk', 'self', 'check-in', 'self-service'],
    },
    {
      id: 'nav-rooms',
      title: 'Room Schedule',
      subtitle: 'View room occupancy matrix',
      icon: <Calendar className="h-4 w-4" />,
      action: () => router.push('/ops/rooms'),
      category: 'navigation',
      keywords: ['rooms', 'schedule', 'matrix', 'occupancy'],
    },
    {
      id: 'nav-alerts',
      title: 'Alerts Center',
      subtitle: 'Monitor system alerts',
      icon: <Zap className="h-4 w-4" />,
      action: () => router.push('/ops/alerts'),
      category: 'navigation',
      keywords: ['alerts', 'notifications', 'sla', 'breaches'],
    },
    {
      id: 'nav-patients',
      title: 'All Patients',
      subtitle: 'Browse patient records',
      icon: <Users className="h-4 w-4" />,
      action: () => router.push('/patients'),
      category: 'navigation',
      keywords: ['patients', 'records', 'browse'],
    },
    {
      id: 'nav-appointments',
      title: 'Appointments',
      subtitle: 'Manage appointments',
      icon: <Calendar className="h-4 w-4" />,
      action: () => router.push('/appointments'),
      category: 'navigation',
      keywords: ['appointments', 'schedule', 'calendar'],
    },

    // Quick Actions
    {
      id: 'action-create-checkin',
      title: 'Create Check-in',
      subtitle: 'Start new patient check-in',
      icon: <Plus className="h-4 w-4" />,
      action: () => {
        router.push('/ops/checkin');
        onClose();
      },
      category: 'actions',
      keywords: ['create', 'new', 'checkin', 'check-in', 'patient'],
    },
    {
      id: 'action-add-patient',
      title: 'Add Patient',
      subtitle: 'Register new patient',
      icon: <Plus className="h-4 w-4" />,
      action: () => {
        router.push('/patients/add');
        onClose();
      },
      category: 'actions',
      keywords: ['add', 'new', 'patient', 'register'],
    },
    {
      id: 'action-toggle-urgent',
      title: 'Toggle Urgent First',
      subtitle: 'Sort queue by urgent priority',
      icon: <Zap className="h-4 w-4" />,
      action: () => {
        // This would toggle a global state for urgent-first sorting
        console.log('Toggled urgent-first sorting');
        onClose();
      },
      category: 'actions',
      keywords: ['toggle', 'urgent', 'first', 'priority', 'sort'],
    },
    {
      id: 'action-switch-layout',
      title: 'Switch Layout',
      subtitle: 'Toggle between dentist/room view',
      icon: <LayoutGrid className="h-4 w-4" />,
      action: () => {
        // This would toggle layout view
        console.log('Switched layout view');
        onClose();
      },
      category: 'actions',
      keywords: ['switch', 'layout', 'view', 'dentist', 'room'],
    },

    // Search
    {
      id: 'search-patients',
      title: 'Search Patients',
      subtitle: 'Find patient records',
      icon: <Search className="h-4 w-4" />,
      action: () => {
        router.push('/patients');
        onClose();
      },
      category: 'search',
      keywords: ['search', 'find', 'patients', 'records'],
    },
    {
      id: 'search-tickets',
      title: 'Search Tickets',
      subtitle: 'Find queue tickets',
      icon: <Search className="h-4 w-4" />,
      action: () => {
        router.push('/ops/queue');
        onClose();
      },
      category: 'search',
      keywords: ['search', 'find', 'tickets', 'queue'],
    },
    {
      id: 'search-rooms',
      title: 'Search Rooms',
      subtitle: 'Find room schedule',
      icon: <Search className="h-4 w-4" />,
      action: () => {
        router.push('/ops/rooms');
        onClose();
      },
      category: 'search',
      keywords: ['search', 'find', 'rooms', 'schedule'],
    },
  ];

  // Filter commands based on query
  const filteredCommands = commands.filter(command => {
    if (!query.trim()) return true;
    
    const searchTerms = query.toLowerCase().split(' ');
    return searchTerms.every(term =>
      command.title.toLowerCase().includes(term) ||
      command.subtitle?.toLowerCase().includes(term) ||
      command.keywords.some(keyword => keyword.toLowerCase().includes(term))
    );
  });

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((groups, command) => {
    const category = command.category;
    if (!groups[category]) groups[category] = [];
    groups[category].push(command);
    return groups;
  }, {} as Record<string, CommandItem[]>);

  const categoryLabels = {
    navigation: 'Navigation',
    actions: 'Quick Actions',
    search: 'Search',
    settings: 'Settings',
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-[20vh]">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-96 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center border-b border-gray-200 px-4 py-3">
          <Search className="h-5 w-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search commands, patients, tickets..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 outline-none text-lg placeholder-gray-400"
          />
          <div className="text-xs text-gray-400">
            ESC to close
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-80 overflow-y-auto">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No commands found for &quot;{query}&quot;
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, commands]) => (
              <div key={category}>
                {/* Category Header */}
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </h3>
                </div>

                {/* Commands in Category */}
                {commands.map((command, index) => {
                  const globalIndex = filteredCommands.indexOf(command);
                  const isSelected = globalIndex === selectedIndex;

                  return (
                    <button
                      key={command.id}
                      onClick={() => {
                        command.action();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 ${
                        isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                    >
                      <div className={`flex-shrink-0 mr-3 ${
                        isSelected ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {command.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium ${
                          isSelected ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {command.title}
                        </div>
                        {command.subtitle && (
                          <div className="text-sm text-gray-500 truncate">
                            {command.subtitle}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="text-xs text-blue-600 ml-2">↵</div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>↑↓ to navigate</span>
              <span>↵ to select</span>
              <span>ESC to close</span>
            </div>
            <div>
              {filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to manage command palette state
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
  };
}