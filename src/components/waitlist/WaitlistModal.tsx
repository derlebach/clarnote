'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: 'integrations' | 'api';
  source?: string;
}

interface FormData {
  email: string;
  termsConsent: boolean;
  marketingConsent: boolean;
}

interface FormErrors {
  email?: string;
  termsConsent?: string;
  general?: string;
}

const MODAL_CONTENT = {
  integrations: {
    title: 'Join the Integrations Waitlist',
    subtitle: 'Be first to try it. Enter your email—takes 5 seconds.',
  },
  api: {
    title: 'Join the API Early Access',
    subtitle: 'Be first to try it. Enter your email—takes 5 seconds.',
  },
};

const SUCCESS_CONTENT = {
  title: "You're on the list 🎉",
  subtitle: "We'll email you as soon as it's ready. Thanks for helping shape Clarnote.",
};

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

function emitAnalytics(event: string, data: any) {
  if (typeof window !== 'undefined' && (window as any).dataLayer) {
    (window as any).dataLayer.push({
      event,
      ...data,
    });
  }
}

export default function WaitlistModal({ isOpen, onClose, context, source }: WaitlistModalProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    termsConsent: false,
    marketingConsent: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // Bot protection
  const [startTime] = useState(Date.now());

  const modalRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  const content = MODAL_CONTENT[context];

  // Focus management and escape key handling
  useEffect(() => {
    if (isOpen) {
      // Emit analytics
      emitAnalytics('waitlist_open', { context, source });
      
      // Focus first element
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);

      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, context, source, onClose]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: '',
        termsConsent: false,
        marketingConsent: false,
      });
      setErrors({});
      setShowSuccess(false);
      setHoneypot('');
    }
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen, showSuccess]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.termsConsent) {
      newErrors.termsConsent = 'You must agree to the Terms and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      emitAnalytics('waitlist_submit_error', { 
        context, 
        source, 
        error: 'validation_failed' 
      });
      return;
    }

    // Bot protection
    if (honeypot) {
      emitAnalytics('waitlist_submit_error', { 
        context, 
        source, 
        error: 'bot_detected' 
      });
      return;
    }

    const timeOnPage = Date.now() - startTime;
    if (timeOnPage < 2000) { // Less than 2 seconds
      emitAnalytics('waitlist_submit_error', { 
        context, 
        source, 
        error: 'too_fast' 
      });
      setErrors({ general: 'Please take a moment to review the form' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    emitAnalytics('waitlist_submit_attempt', { context, source });

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          context,
          marketingConsent: formData.marketingConsent,
          termsConsent: formData.termsConsent,
          source: source || `${context}:modal`,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      });

      const result = await response.json();

      if (result.ok) {
        setShowSuccess(true);
        emitAnalytics('waitlist_submit_success', { context, source });
      } else {
        throw new Error(result.message || 'Failed to join waitlist');
      }
    } catch (error) {
      console.error('Waitlist submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setErrors({ general: errorMessage });
      emitAnalytics('waitlist_submit_error', { 
        context, 
        source, 
        error: errorMessage 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-title"
      aria-describedby="waitlist-description"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          ref={firstFocusableRef}
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="p-8 pt-12">
          {showSuccess ? (
            // Success state
            <div className="text-center">
              <h2 
                id="waitlist-title"
                className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
              >
                {SUCCESS_CONTENT.title}
              </h2>
              <p 
                id="waitlist-description"
                className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
              >
                {SUCCESS_CONTENT.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                >
                  Close
                </button>
                <a
                  href="/"
                  className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 rounded-full"
                >
                  Back to site
                </a>
              </div>
            </div>
          ) : (
            // Form state
            <>
              <div className="text-center mb-8">
                <h2 
                  id="waitlist-title"
                  className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
                >
                  {content.title}
                </h2>
                <p 
                  id="waitlist-description"
                  className="text-gray-600 dark:text-gray-300 leading-relaxed"
                >
                  {content.subtitle}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot field - hidden from users */}
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                {/* Email field */}
                <div>
                  <label 
                    htmlFor="waitlist-email" 
                    className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
                  >
                    Email address
                  </label>
                  <input
                    ref={emailInputRef}
                    id="waitlist-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-4 py-4 text-lg border rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 transition-all ${
                      errors.email
                        ? 'border-red-300 focus:ring-red-100 dark:border-red-600 dark:focus:ring-red-900/20'
                        : 'border-gray-200 dark:border-gray-700 focus:ring-gray-100 dark:focus:ring-gray-800 focus:border-gray-400 dark:focus:border-gray-500'
                    }`}
                    placeholder="you@company.com"
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Terms consent */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.termsConsent}
                      onChange={(e) => setFormData(prev => ({ ...prev, termsConsent: e.target.checked }))}
                      className={`mt-0.5 w-4 h-4 rounded border-2 focus:ring-4 focus:ring-offset-0 transition-all ${
                        errors.termsConsent
                          ? 'border-red-300 focus:ring-red-100 dark:border-red-600 dark:focus:ring-red-900/20'
                          : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-gray-100 dark:focus:ring-gray-800'
                      }`}
                      disabled={isSubmitting}
                      required
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      I agree to the{' '}
                      <a 
                        href="/terms" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-900 dark:text-white hover:underline focus:outline-none focus:underline"
                      >
                        Terms
                      </a>{' '}
                      and{' '}
                      <a 
                        href="/privacy" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-900 dark:text-white hover:underline focus:outline-none focus:underline"
                      >
                        Privacy Policy
                      </a>
                      . <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.termsConsent && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
                      {errors.termsConsent}
                    </p>
                  )}
                </div>

                {/* Marketing consent */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.marketingConsent}
                      onChange={(e) => setFormData(prev => ({ ...prev, marketingConsent: e.target.checked }))}
                      className="mt-0.5 w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-800 focus:ring-offset-0 transition-all"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      Send me product updates and marketing emails.
                    </span>
                  </label>
                </div>

                {/* General error */}
                {errors.general && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                      {errors.general}
                    </p>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 transform active:scale-[0.98]"
                >
                  {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                </button>

                {/* Trust text */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  No spam. Unsubscribe anytime.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 