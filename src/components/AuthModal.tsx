import React, { useState } from 'react';
import { Shield, Chrome, Mail, Lock, AlertCircle } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import { supabase } from '../utils/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setIsSignUp(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-bright rounded-lg mb-6 shadow-light dark:shadow-dark animate-pulse-glow">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-2 uppercase tracking-wide">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium">
          {isSignUp 
            ? 'Join thousands securing their promo codes' 
            : 'Sign in to access your encrypted vault'
          }
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-accent-error/10 border border-accent-error/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-accent-error" />
            <span className="font-sans text-small text-accent-error">{error}</span>
          </div>
        </div>
      )}

      {/* Google OAuth Button */}
      <div className="mb-6">
        <Button
          variant="secondary"
          size="large"
          className="w-full border-2 border-neutral-medium hover:border-primary-bright"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <Chrome className="w-5 h-5 mr-3" />
          Continue with Google
        </Button>
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-medium/30" />
        </div>
        <div className="relative flex justify-center text-small">
          <span className="bg-white dark:bg-neutral-dark px-4 text-neutral-medium font-sans">
            or continue with email
          </span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-5 h-5" />}
          required
        />
        <Input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-5 h-5" />}
          required
        />
        <Button
          variant="primary"
          size="large"
          className="w-full"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
        </Button>
      </form>

      {/* Toggle Sign Up/Sign In */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            resetForm();
          }}
          className="font-sans text-small text-primary-bright hover:text-primary-deep transition-colors duration-200"
        >
          {isSignUp 
            ? 'Already have an account? Sign in' 
            : "Don't have an account? Sign up"
          }
        </button>
      </div>

      {/* Security Notice */}
      <div className="mt-8 p-4 bg-primary-bright/10 border border-primary-bright/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-primary-bright mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-sans font-medium text-primary-bright mb-1">
              Zero-Knowledge Security
            </h4>
            <p className="font-sans text-small text-neutral-dark dark:text-neutral-medium">
              Your master password never leaves your device. We cannot see your promo codes even if we wanted to.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;