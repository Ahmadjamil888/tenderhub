import { useState, useEffect } from "react";
import { Badge } from "./badge";
import { Clock, AlertTriangle } from "lucide-react";

type ClosingCountdownTimerProps = {
  closingDate: Date;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
};

export function ClosingCountdownTimer({
  closingDate,
  className = "",
  showLabel = true,
  size = "md"
}: ClosingCountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isClosed: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = closingDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isClosed: true
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isClosed: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [closingDate]);

  const isUrgent = !timeLeft.isClosed && (
    timeLeft.days === 0 && timeLeft.hours < 24
  );

  const isCritical = !timeLeft.isClosed && (
    timeLeft.days === 0 && timeLeft.hours < 1
  );

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  if (timeLeft.isClosed) {
    return (
      <Badge variant="destructive" className={`${sizeClasses[size]} ${className}`}>
        <Clock className="mr-1 h-3 w-3" />
        Closed
      </Badge>
    );
  }

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className={`text-slate-500 ${sizeClasses[size]}`}>Closes in:</span>
      )}
      <Badge 
        variant={isCritical ? "destructive" : isUrgent ? "outline" : "secondary"}
        className={`${isCritical ? 'animate-pulse bg-red-600' : ''} ${sizeClasses[size]}`}
      >
        {isCritical && <AlertTriangle className="mr-1 h-3 w-3" />}
        <Clock className="mr-1 h-3 w-3" />
        {timeLeft.days > 0 && `${formatTime(timeLeft.days)}d `}
        {formatTime(timeLeft.hours)}h {formatTime(timeLeft.minutes)}m {formatTime(timeLeft.seconds)}s
      </Badge>
    </div>
  );
}
