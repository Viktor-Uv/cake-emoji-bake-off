import React from 'react';
import { isUsingEmulators } from '@/utils/firebase-utils';

/**
 * A component that displays a visual indicator when the application is using Firebase emulators
 * Only shown in development mode and when emulators are enabled
 */
export function EmulatorIndicator() {
  // Only show when emulators are running
  if (!isUsingEmulators()) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '10px',
        backgroundColor: 'rgba(255,0,0,0.4)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        zIndex: 9999,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
      }}
    >
      Using Firebase Emulators
    </div>
  );
}
