'use client';

import { useEffect } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';

export const PrivyWrapper = ({ children }: { children: React.ReactNode }) => {
  // Use useEffect to log when the component mounts
  useEffect(() => {
    console.log("PrivyWrapper loaded and PrivyProvider is now wrapping the app.");
  }, []);

  return (
    <PrivyProvider
      appId="clxnzww0l02bl29rq6jnddkwt"
    >
      {children}
    </PrivyProvider>
  );
}
