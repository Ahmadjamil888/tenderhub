import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { seedIfEmpty } from "@/lib/local-store";
import { Navigate } from "react-router-dom";

import SupplierDashboard from "./SupplierDashboard";
import CommandCenter from "./CommandCenter";

/**
 * Dashboard router — renders an actual dashboard instead of bouncing
 * every user to /briefing (which caused the "My Workspace redirects
 * back to Briefing" loop). Suppliers still go to their portal.
 */
export default function DashboardRouter() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) seedIfEmpty(user.name);
  }, [user]);

  switch (user?.role) {
    case "public":
      return <Navigate to="/supplier-portal" replace />;
    case "supplier":
    case "sme_supplier":
    case "vendor_user":
      return <SupplierDashboard />;
    default:
      return <CommandCenter />;
  }
}
