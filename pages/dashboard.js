import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
// Import the actual client dashboard content component
import ClientDashboard from "../components/ClientDashboard";

export default function DashboardRouter() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login
        router.push("/login");
        return;
      }

      // Check for admin role first, which is the final fix to your routing issue.
      if (user.role === "admin") {
        // Admin logged in, redirect to admin panel
        router.push("/admin");
        return;
      }
    }
  }, [user, loading, router]);

  // While loading or if user is admin (waiting for redirect), show spinner
  if (loading || (user && user.role === "admin")) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is a client (role !== 'admin' and user is loaded), render the client UI
  if (user && user.role === "client") {
    return <ClientDashboard user={user} />;
  }

  return null; // Should not happen after checks
}
