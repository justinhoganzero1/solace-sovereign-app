import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function BackendFunctionsAlert() {
  return (
    <Alert className="bg-red-50 border-red-300">
      <AlertCircle className="h-5 w-5 text-red-600" />
      <AlertTitle className="text-red-900 font-bold">Backend Functions Not Enabled</AlertTitle>
      <AlertDescription className="text-red-800">
        <div className="space-y-2 mt-2">
          <p className="font-medium">Voice features require backend functions. To enable:</p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Click <strong>"Dashboard"</strong> in the top navigation</li>
            <li>Go to <strong>Settings</strong> (gear icon)</li>
            <li>Find <strong>"Backend Functions"</strong></li>
            <li>Click <strong>"Enable"</strong></li>
          </ol>
          <p className="text-sm mt-3">Once enabled, return here and test your voice.</p>
        </div>
      </AlertDescription>
    </Alert>
  );
}