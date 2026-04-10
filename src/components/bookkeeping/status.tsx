// src/config/status.tsx
import { Badge } from "@/components/ui/badge";

export const getStatusBadge = (status: string | null) => {
  const s = status?.toLowerCase() || "";

  switch (s) {
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
          Pending
        </Badge>
      );
    case "delivered":
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
          Delivered
        </Badge>
      );
    case "cancelled":
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200">
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="outline">{status || "Unknown"}</Badge>;
  }
};