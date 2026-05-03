import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initializeAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      setSession(session);
      setUser(session?.user ?? null);
    } catch (err) {
      setError(err?.message || 'Failed to verify your session.');
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let hadSession = false;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'TOKEN_REFRESHED') {
          if (!session) {
            // Refresh failed → session expired
            handleSessionExpired();
            return;
          }
          setSession(session);
          setUser(session?.user ?? null);
          hadSession = true;
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          if (hadSession) {
            // Unexpected sign-out (likely expiry) while user was active
            const protectedPaths = ['/', '/about', '/contact'];
            if (protectedPaths.includes(window.location.pathname)) {
              const redirect = encodeURIComponent(window.location.pathname + window.location.search);
              toast.info('Your session has expired. Please sign in again.');
              window.location.href = `/auth?redirect=${redirect}`;
            }
          }
          hadSession = false;
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          if (session) hadSession = true;
        }
        setError(null);
        setLoading(false);
      }
    );

    const handleSessionExpired = async () => {
      setSession(null);
      setUser(null);
      setLoading(false);
      try {
        await supabase.auth.signOut();
      } catch (_) {
        // ignore
      }
      toast.info('Your session has expired. Please sign in again.', {
        description: 'You have been signed out automatically.',
      });
      const protectedPaths = ['/', '/about', '/contact'];
      if (protectedPaths.includes(window.location.pathname)) {
        const redirect = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/auth?redirect=${redirect}`;
      }
      hadSession = false;
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
      toast.success('Account created successfully!');
      return { error: null };
    } catch (error) {
      toast.error(error.message);
      return { error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      toast.success('Logged in successfully!');
      return { error: null };
    } catch (error) {
      toast.error(error.message);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    retryAuth: initializeAuth,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
