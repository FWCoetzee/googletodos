import { Navigate } from 'react-router-dom';
import { Loader2, AlertCircle, RefreshCw, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const ProtectedRoute = ({ children }) => {
  const { user, loading, error, retryAuth } = useAuth();

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-background via-background to-secondary/20 px-4"
      >
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">Verifying your session…</p>
          <p className="text-sm text-muted-foreground mt-1">
            Checking authentication, this should only take a moment.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 px-4"
      >
        <div className="w-full max-w-md space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Authentication failed</AlertTitle>
            <AlertDescription className="mt-2 break-words">{error}</AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button onClick={retryAuth} className="flex-1 gap-2">
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
            <Button asChild variant="outline" className="flex-1 gap-2">
              <a href="/auth">
                <LogIn className="h-4 w-4" />
                Go to login
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};
