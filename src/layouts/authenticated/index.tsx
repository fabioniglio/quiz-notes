import { ROUTES } from "@/lib/constants";
import { api } from "@convex/api";
import { useConvexAuth, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { generatePath, Outlet, useNavigate } from "react-router";
import { Sidebar } from "./components/sidebar";

export function AuthenticatedLayout() {
  const user = useQuery(api.users.getCurrentUser);
  const state = useConvexAuth();
  const isLoading = user === undefined || state.isLoading;
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated
    // This prevents redirect loops during loading
    if (!isLoading && !user && state.isAuthenticated === false) {
      console.log("User not authenticated, redirecting to login");
      void navigate(generatePath(ROUTES.login));
    }
  }, [isLoading, user, navigate, state.isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    // root wrapper has flex column
    <div className="flex w-full grow">
      <Sidebar />
      <div className="min-h-screen grow p-6 md:p-8 lg:p-10">
        <Outlet />
      </div>
    </div>
  );
}
