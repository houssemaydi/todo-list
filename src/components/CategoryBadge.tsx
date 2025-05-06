
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

type CategoryBadgeProps = {
  category: string | null;
};

const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  if (!category) {
    return null;
  }
  
  return (
    <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-medium flex items-center gap-1">
      <Tag size={12} />
      <span>{category}</span>
    </Badge>
  );
};

export default CategoryBadge;
