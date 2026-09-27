import { supabase } from '@/integrations/supabase/client';

// reCAPTCHA v3 site key (public — safe to commit). Set after creating keys
// at https://www.google.com/recaptcha/admin/create
export const RECAPTCHA_SITE_KEY = 'PASTE_YOUR_RECAPTCHA_V3_SITE_KEY_HERE';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => resolve());
      return;
    }
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => window.grecaptcha?.ready(() => resolve());
    script.onerror = () => reject(new Error('Failed to load CAPTCHA'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function isRecaptchaConfigured(): boolean {
  return !RECAPTCHA_SITE_KEY.startsWith('PASTE_');
}

/**
 * Gets a reCAPTCHA v3 token and verifies it with the backend edge function,
 * which also enforces per-IP rate limits. Throws with a user-friendly
 * message when the check fails.
 */
export async function verifyCaptcha(action: 'signup' | 'todo_create'): Promise<void> {
  if (!isRecaptchaConfigured()) {
    throw new Error('CAPTCHA is not configured yet. Please try again later.');
  }

  await loadScript();
  const token = await window.grecaptcha!.execute(RECAPTCHA_SITE_KEY, { action });

  const { data, error } = await supabase.functions.invoke('verify-captcha', {
    body: { token, action },
  });

  if (error) {
    // supabase-js puts non-2xx bodies on the error context
    const message =
      (data as { error?: string } | null)?.error ||
      'Bot check failed. Please wait a moment and try again.';
    throw new Error(message);
  }
  if ((data as { error?: string } | null)?.error) {
    throw new Error((data as { error: string }).error);
  }
}
