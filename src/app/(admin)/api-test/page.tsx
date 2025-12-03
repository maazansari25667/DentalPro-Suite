'use client';

import { useEffect, useState } from 'react';

export default function APITestPage() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testEndpoints = async () => {
      const endpoints = [
        { name: 'Dentists', url: '/api/dentists' },
        { name: 'Rooms', url: '/api/rooms' },
        { name: 'Procedures', url: '/api/procedures' },
        { name: 'Appointments', url: '/api/appointments' },
        { name: 'Check-ins', url: '/api/checkins' },
        { name: 'Queue', url: '/api/queue' }
      ];

      const testResults: Record<string, any> = {};

      for (const endpoint of endpoints) {
        try {
          console.log(`Testing ${endpoint.name}...`);
          const response = await fetch(endpoint.url);
          const data = await response.json();
          
          testResults[endpoint.name] = {
            status: response.status,
            success: response.ok,
            data: data.data || data,
            count: Array.isArray(data.data) ? data.data.length : 'N/A'
          };
          
          console.log(`✅ ${endpoint.name}: ${response.status} - ${Array.isArray(data.data) ? data.data.length : 'N/A'} items`);
        } catch (error) {
          console.error(`❌ ${endpoint.name} failed:`, error);
          testResults[endpoint.name] = {
            status: 'ERROR',
            success: false,
            error: (error as Error).message,
            count: 0
          };
        }
      }

      setResults(testResults);
      setLoading(false);
    };

    testEndpoints();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">API Endpoint Test</h1>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>Testing endpoints...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">🔍 API Endpoint Test Results</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(results).map(([name, result]) => (
          <div 
            key={name} 
            className={`border rounded-lg p-4 ${
              result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}
          >
            <h3 className={`font-semibold text-lg mb-2 ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.success ? '✅' : '❌'} {name}
            </h3>
            
            <div className="space-y-1 text-sm">
              <p className={`font-medium ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                Status: {result.status}
              </p>
              
              {result.success && (
                <>
                  <p className="text-green-600">
                    Count: <span className="font-bold">{result.count}</span> items
                  </p>
                  
                  {result.data && Array.isArray(result.data) && result.data.length > 0 && (
                    <div className="mt-2 p-2 bg-white rounded border">
                      <p className="text-xs text-gray-600">Sample data:</p>
                      <pre className="text-xs text-gray-800 mt-1 overflow-hidden">
                        {JSON.stringify(result.data[0], null, 2).substring(0, 200)}
                        {JSON.stringify(result.data[0], null, 2).length > 200 ? '...' : ''}
                      </pre>
                    </div>
                  )}
                </>
              )}
              
              {!result.success && result.error && (
                <p className="text-red-600 text-xs break-words">
                  Error: {result.error}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">🎯 Test Summary</h2>
        <p className="text-blue-700">
          Successfully tested <span className="font-bold">{Object.values(results).filter(r => r.success).length}</span> out of{' '}
          <span className="font-bold">{Object.keys(results).length}</span> endpoints.
        </p>
        
        {Object.values(results).every(r => r.success) && (
          <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
            <p className="text-green-800 font-medium">🎉 All endpoints are working correctly!</p>
            <p className="text-green-700 text-sm mt-1">
              MSW mock API is fully operational and serving realistic data.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>
          Open the browser console to see detailed logs of the API testing process.
        </p>
      </div>
    </div>
  );
}