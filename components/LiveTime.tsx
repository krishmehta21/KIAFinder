'use client';

import React, { useState, useEffect } from 'react';

export default function LiveTime() {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      } as const;
      setTimeStr(new Intl.DateTimeFormat('en-US', options).format(new Date()));
    };

    update();
    // Update every 60 seconds to optimize performance
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, []);

  if (!timeStr) return <span className="text-neutral-500 text-xs">--:-- IST</span>;

  return (
    <span className="font-mono text-neutral-400 text-xs tracking-wider bg-neutral-900/60 px-2.5 py-1 rounded-md border border-neutral-800 shrink-0">
      {timeStr} IST
    </span>
  );
}
