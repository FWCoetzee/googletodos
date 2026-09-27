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
import { verifyCaptcha } from '@/lib/recaptcha';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });

    if (result.error) {
      setIsLoading(false);
      toast.error(result.error.message || 'Google sign-in failed. Please try again.');
      return;
    }

    if (result.redirected) {
      // Browser is redirecting to Google - keep the loading state
      return;
    }

    // Session already set - the user effect will navigate to safeRedirect
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isForgot) {
      await handleForgotPassword();
      return;
    }

    setIsLoading(true);

    // Bot protection: invisible reCAPTCHA + server-side rate limit on sign-up
    if (isSignUp) {
      try {
        await verifyCaptcha('signup');
      } catch (captchaError) {
        setIsLoading(false);
        toast.error(captchaError.message || 'Bot check failed. Please try again.');
        return;
      }
    }

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

            {!isForgot && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 gap-3"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </Button>
              </>
            )}

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
