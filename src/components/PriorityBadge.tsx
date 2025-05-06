
import React from "react";
import { Badge } from "@/components/ui/badge";

type PriorityProps = {
  priority: "low" | "medium" | "high";
  isButton?: boolean;
  className?: string;
};

const PriorityBadge = ({ priority, isButton = false, className = "" }: PriorityProps) => {
  const priorityConfig = {
    high: {
      color: "bg-red-500 hover:bg-red-600",
      label: "High",
    },
    medium: {
      color: "bg-orange-400 hover:bg-orange-500",
      label: "Medium",
    },
    low: {
      color: "bg-green-500 hover:bg-green-600",
      label: "Low",
    },
  };

  const config = priorityConfig[priority];

  return (
    <Badge 
      className={`${config.color} text-white font-medium ${isButton ? 'cursor-pointer' : ''} ${className}`}
    >
      {config.label}
    </Badge>
  );
};

export default PriorityBadge;
