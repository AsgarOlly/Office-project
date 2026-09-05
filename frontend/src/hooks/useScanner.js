import { useState, useCallback } from 'react';

export const useScanner = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openScanner = useCallback(() => setIsOpen(true), []);
  const closeScanner = useCallback(() => setIsOpen(false), []);
  const toggleScanner = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    openScanner,
    closeScanner,
    toggleScanner,
  };
};

export default useScanner;
