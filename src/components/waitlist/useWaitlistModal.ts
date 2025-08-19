'use client';

import { useState, useCallback } from 'react';

type WaitlistContext = 'integrations' | 'api';

interface UseWaitlistModalReturn {
  isOpen: boolean;
  context: WaitlistContext | null;
  source: string | undefined;
  openIntegrationsWaitlist: (source?: string) => void;
  openApiWaitlist: (source?: string) => void;
  closeWaitlist: () => void;
}

export function useWaitlistModal(): UseWaitlistModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<WaitlistContext | null>(null);
  const [source, setSource] = useState<string | undefined>();

  const openIntegrationsWaitlist = useCallback((source?: string) => {
    setContext('integrations');
    setSource(source);
    setIsOpen(true);
  }, []);

  const openApiWaitlist = useCallback((source?: string) => {
    setContext('api');
    setSource(source);
    setIsOpen(true);
  }, []);

  const closeWaitlist = useCallback(() => {
    setIsOpen(false);
    // Keep context and source until next open for analytics
  }, []);

  return {
    isOpen,
    context,
    source,
    openIntegrationsWaitlist,
    openApiWaitlist,
    closeWaitlist,
  };
} 