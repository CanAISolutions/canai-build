import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface IntentData {
  confidenceScore?: number;
}

const IntentMirror: React.FC = () => {
  const [isValid, setIsValid] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [intentData] = useState<IntentData | null>(null);

  useEffect(() => {
    console.debug('Confirm button render:', {
      isValid,
      isConfirming,
      disabled: !isValid || isConfirming,
    });
    if (intentData?.confidenceScore && intentData.confidenceScore >= 0.8)
      setIsValid(true);
  }, [intentData, isConfirming, isValid]);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      // API call or logic
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Button
      id="confirm-btn"
      disabled={!isValid || isConfirming}
      onClick={handleConfirm}
      className="inline-flex items-center justify-center rounded-md text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
      aria-label="Confirm"
    >
      Confirm
    </Button>
  );
};

export default IntentMirror;
