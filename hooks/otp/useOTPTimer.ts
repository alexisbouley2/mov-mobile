// hooks/otp/useOTPTimer.ts
import { useState, useEffect } from "react";

interface UseOTPTimerProps {
  initialCountdown?: number;
  resendCountdown?: number;
}

export const useOTPTimer = ({
  initialCountdown = 30,
  resendCountdown = 60,
}: UseOTPTimerProps = {}) => {
  const [countdown, setCountdown] = useState(initialCountdown);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const resetTimer = (newCountdown = resendCountdown) => {
    setCountdown(newCountdown);
  };

  const isTimerFinished = countdown === 0;

  return {
    countdown,
    isTimerFinished,
    resetTimer,
  };
};
