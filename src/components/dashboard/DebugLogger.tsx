
import { useEffect } from 'react';

interface DebugLoggerProps {
  title: string;
  data: any;
}

export const DebugLogger = ({ title, data }: DebugLoggerProps) => {
  useEffect(() => {
    console.log(`Debug ${title}:`, data);
  }, [title, data]);
  
  // This component doesn't render anything visible
  return null;
};
