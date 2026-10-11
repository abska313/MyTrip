import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-[#6D1028] bg-[#151316]/95 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-[#F4F0F1] shadow-2xl animate-pulse">
      <WifiOff className="w-3.5 h-3.5 text-[#922D48]" />
      <span>وضع عدم الاتصال — كافة البيانات والوظائف تعمل محليًا</span>
    </div>
  );
};
