import { useState } from 'react';

export const usePrintStatus = () => {
  const [status, setStatus] = useState<null | keyof typeof import('../constants/printStatusConfig').printStatusConfig>(null);

  const clearStatus = () => {
    setStatus(null);
  };

  return { status, setStatus, clearStatus };
};
