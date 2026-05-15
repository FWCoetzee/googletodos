import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckSquare } from 'lucide-react';
import { z } from 'zod';
import { PageTransition } from '@/components/PageTransition';
import { sanitizeRedirect } from '@/lib/auth-redirect';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const authSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const emailOnlySchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

const Auth = () => {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signIn, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const safeRedirect = sanitizeRedirect(searchParams.get('redirect'));

  const isSignUp = mode === 'signup';
  const isForgot = mode === 'forgot';

  useEffect(() => {
    if (user && !isForgot) {
      navigate(safeRedirect, { replace: true });
    }
  }, [user, navigate, safeRedirect, isForgot]);

  const validateForm = () => {
    try {
      if (isForgot) {
        emailOnlySchema.parse({ email });
      } else {
        authSchema.parse({ email, password });
      }
      setErrors({});
      return true;
    } catch (error) {
      const formattedErrors = {};
      error.errors.forEach((err) => {
        formattedErrors[err.path[0]] = err.message;
      });
      setErrors(formattedErrors);
      return false;
    }
  };

  const handleForgotPassword = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Check your email for a password reset link.');
      setMode('signin');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isForgot) {
      await handleForgotPassword();
      return;
    }

    setIsLoading(true);
    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    setIsLoading(false);

    if (!error) {
      navigate(safeRedirect, { replace: true });
    }
  };

  const headingTitle = isForgot
    ? 'Reset Password'
    : isSignUp
      ? 'Create Account'
      : 'Welcome Back';
  const headingSubtitle = isForgot
    ? "Enter your email and we'll send you a reset link"
    : isSignUp
      ? 'Sign up to start organizing your tasks'
      : 'Sign in to continue to your todos';
  const submitLabel = isForgot
    ? 'Send Reset Link'
    : isSignUp
      ? 'Sign Up'
      : 'Sign In';

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-glow mb-4">
              <CheckSquare className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {headingTitle}
            </h1>
            <p className="text-muted-foreground">{headingSubtitle}</p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {!isForgot && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setErrors({}); }}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12"
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-primary to-accent shadow-glow"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : submitLabel}
              </Button>
            </form>

            <div className="mt-6 text-center">
              {isForgot ? (
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setErrors({}); }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Back to sign in
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setMode(isSignUp ? 'signin' : 'signup'); setErrors({}); }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Auth;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signIn, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const safeRedirect = sanitizeRedirect(searchParams.get('redirect'));

  useEffect(() => {
    if (user) {
      navigate(safeRedirect, { replace: true });
    }
  }, [user, navigate, safeRedirect]);

  const validateForm = () => {
    try {
      authSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error) {
      const formattedErrors = {};
      error.errors.forEach((err) => {
        formattedErrors[err.path[0]] = err.message;
      });
      setErrors(formattedErrors);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    const { error } = isSignUp 
      ? await signUp(email, password)
      : await signIn(email, password);

    setIsLoading(false);

    if (!error) {
      navigate(safeRedirect, { replace: true });
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-glow mb-4">
              <CheckSquare className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp ? 'Sign up to start organizing your tasks' : 'Sign in to continue to your todos'}
            </p>
          </div>

          {/* Form */}
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-primary to-accent shadow-glow"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrors({});
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Auth;
