'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Set countdown to 24 hours from now
    const targetTime = Date.now() + 24 * 60 * 60 * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const difference = targetTime - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="bg-dark-card border border-primary/30 rounded-xl px-4 py-3 min-w-[70px] hover:border-primary/60 transition">
      <div className="text-2xl font-bold text-primary mb-1">{String(value).padStart(2, '0')}</div>
      <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
    </div>
  );

  return (
    <div className="flex items-center gap-3 justify-center flex-wrap">
      <Clock className="w-5 h-5 text-primary" />
      {timeLeft.days > 0 && (
        <>
          <TimeUnit value={timeLeft.days} label="Ngày" />
          <span className="text-primary text-xl">:</span>
        </>
      )}
      <TimeUnit value={timeLeft.hours} label="Giờ" />
      <span className="text-primary text-xl">:</span>
      <TimeUnit value={timeLeft.minutes} label="Phút" />
      <span className="text-primary text-xl">:</span>
      <TimeUnit value={timeLeft.seconds} label="Giây" />
    </div>
  );
}
