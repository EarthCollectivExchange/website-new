'use client';

import { useState, useEffect } from 'react';

export function useExpiryCountdown(expiresAt?: string): { label: string; urgent: boolean; expired: boolean } {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!expiresAt) return { label: '', urgent: false, expired: false };

  const msLeft = new Date(expiresAt).getTime() - now;
  if (msLeft <= 0) return { label: 'Expired', urgent: true, expired: true };

  const sec = Math.floor(msLeft / 1000);
  const min = Math.floor(sec / 60);
  const hr  = Math.floor(min / 60);
  const days = Math.floor(hr / 24);

  const urgent = msLeft < 60_000;
  let label: string;
  if (days >= 2)     label = `${days}d`;
  else if (hr >= 1)  label = `${hr}h ${min % 60}m`;
  else if (min >= 1) label = `${min}m ${sec % 60}s`;
  else               label = `${sec}s`;

  return { label, urgent, expired: false };
}
