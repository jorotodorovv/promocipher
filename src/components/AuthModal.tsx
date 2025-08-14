import React, { useState } from 'react';
import { Shield, Chrome, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    
    // Additional validation for sign up
    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (!agreeToTerms) {
        setError('Please agree to the Terms of Service and Privacy Policy');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
    }
    
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // Show success message for sign up
        setError(null);
        alert('Account created successfully! Please check your email to verify your account.');
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
    setConfirmPassword('');
    setAgreeToTerms(false);
    setShowPassword(false);
    setError(null);
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
            ? 'Join thousands of users who trust PromoCipher to secure their savings' 
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
Don't
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
          {isSignUp ? 'Sign up with Google' : 'Continue with Google'}
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
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-5 h-5" />}
            required
            minLength={8}
            className="pr-12"
          />
          
          {/* Confirm Password Field - Only for Sign Up */}
          {isSignUp && (
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="w-5 h-5" />}
              required
              minLength={8}
              className="pr-12"
            />
          )}
          
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-3 p-1 hover:bg-neutral-light dark:hover:bg-neutral-medium/20 rounded transition-colors duration-200 ${
              isSignUp ? 'top-[calc(50%-20px)]' : 'top-1/2 transform -translate-y-1/2'
            }`}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5 text-neutral-medium" />
            ) : (
              <Eye className="w-5 h-5 text-neutral-medium" />
            )}
          </button>
        </div>

        {/* Password Requirements - Only for Sign Up */}
        {isSignUp && (
          <div className="text-left space-y-2">
            <p className="font-sans text-small text-neutral-medium font-medium">
              Password Requirements:
            </p>
            <ul className="space-y-1 text-small text-neutral-medium">
              <li className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${password.length >= 8 ? 'bg-accent-success' : 'bg-neutral-medium'}`} />
                <span>At least 8 characters</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(password) ? 'bg-accent-success' : 'bg-neutral-medium'}`} />
                <span>One uppercase letter</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(password) ? 'bg-accent-success' : 'bg-neutral-medium'}`} />
                <span>One number</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${password === confirmPassword && password.length > 0 ? 'bg-accent-success' : 'bg-neutral-medium'}`} />
                <span>Passwords match</span>
              </li>
            </ul>
          </div>
        )}

        {/* Terms Agreement - Only for Sign Up */}
        {isSignUp && (
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="terms"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-primary-bright bg-gray-100 border-gray-300 rounded focus:ring-primary-bright focus:ring-2"
            />
            <label htmlFor="terms" className="font-sans text-small text-neutral-dark dark:text-neutral-medium text-left">
              I agree to the{' '}
              <a href="#terms" className="text-primary-bright hover:text-primary-deep underline">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="#privacy" className="text-primary-bright hover:text-primary-deep underline">
                Privacy Policy
              </a>
            </label>
          </div>
        )}

        <Button
          variant="primary"
          size="large"
          className="w-full"
          type="submit"
          disabled={
            loading || 
            password.length < 8 || 
            (isSignUp && (password !== confirmPassword || !agreeToTerms))
          }
        >
          {loading ? (
            isSignUp ? 'Creating account...' : 'Signing in...'
          ) : (
            isSignUp ? 'Create Account' : 'Sign In'
          )}
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

      {/* Additional Info for Sign Up */}
      {isSignUp && (
        <div className="mt-6 p-4 bg-accent-success/10 border border-accent-success/20 rounded-lg text-left">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-accent-success mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-sans font-medium text-accent-success mb-2">
                What happens next?
              </h4>
              <ul className="space-y-1 font-sans text-small text-neutral-dark dark:text-neutral-medium">
                <li>• Account created with military-grade encryption</li>
                <li>• You'll create a master password to encrypt your vault</li>
                <li>• Start adding promo codes immediately</li>
                <li>• Your data is encrypted before it ever leaves your device</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className={`${isSignUp ? 'mt-4' : 'mt-8'} p-4 bg-primary-bright/10 border border-primary-bright/20 rounded-lg text-left`}>
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-primary-bright mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-sans font-medium text-primary-bright mb-2">
              Zero-Knowledge Security
            </h4>
            <p className="font-sans text-small text-neutral-dark dark:text-neutral-medium">
              {isSignUp 
                ? 'Your master password will never leave your device. We cannot recover it if you forget it.'
                : 'Your master password never leaves this device. All encryption happens locally in your browser.'
              }
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AuthModal;