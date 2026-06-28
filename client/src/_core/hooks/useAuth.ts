import { trpc } from "../../lib/trpc.ts";
import { useLocation } from "wouter";

export function useAuth() {
  const [_, setLocation] = useLocation();
  
  const { data: user, isLoading, refetch } = trpc.auth.me.useQuery(undefined, {
    retry: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      refetch();
      // Redirect to bypass oauth login page
      window.location.href = "/app-auth";
    }
  });

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    logout: handleLogout,
    isLoggingOut: logoutMutation.isPending,
    refetch,
  };
}
