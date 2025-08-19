import React, { useState, useEffect } from 'react';
import { Shield, Lock, AlertCircle, Eye, EyeOff, AlertTriangle as TriangleAlert, AlertTriangle } from 'lucide-react';
import Input from './ui/Input';
import Card from './ui/Card';
import Button from './ui/Button';

interface MasterPasswordInputProps {
  hasExistingSalt: boolean;
  onPasswordSubmit: (password: string, rememberMe?: boolean) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onResetPassword?: () => void;
}

const MasterPasswordInput: React.FC<MasterPasswordInputProps> = ({
  hasExistingSalt,
  onPasswordSubmit,
  isLoading,
  error,
  onResetPassword
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFirstTime] = useState(!hasExistingSalt);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeToRisks, setAgreeToRisks] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Show reset dialog when password validation fails
  useEffect(() => {
    if (error === 'INVALID_PASSWORD') {
      setShowResetDialog(true);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      await onPasswordSubmit(password, rememberMe);
    }
  };

  const handleResetConfirm = () => {
    setShowResetDialog(false);
    if (onResetPassword) {
      onResetPassword();
    }
  };

  const handleResetCancel = () => {
    setShowResetDialog(false);
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-bright rounded-lg mb-8 shadow-light dark:shadow-dark animate-pulse-glow">
            <Shield className="w-10 h-10 text-white" />
          </div>

          <h2 className="font-pixel text-h2 text-neutral-dark dark:text-white mb-4 uppercase tracking-wide">
            {isFirstTime ? 'Create Master Password' : 'Enter Master Password'}
          </h2>
          
          <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium mb-8 leading-relaxed">
            {isFirstTime 
              ? 'Create a strong master password to encrypt your promo codes. This password will never leave your device.'
              : 'Enter your master password to unlock your encrypted promo codes.'
            }
          </p>

          {error && error !== 'INVALID_PASSWORD' && (
            <div className="mb-6 p-4 bg-accent-error/10 border border-accent-error/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-accent-error" />
                <span className="font-sans text-small text-accent-error">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your master password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-5 h-5" />}
                required
                minLength={8}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-neutral-light dark:hover:bg-neutral-medium/20 rounded transition-colors duration-200"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-neutral-medium" />
                ) : (
                  <Eye className="w-5 h-5 text-neutral-medium" />
                )}
              </button>
            </div>

            {isFirstTime && (
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
                </ul>
              </div>
            )}

            {/* Remember Me Option */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => {
                    setRememberMe(e.target.checked);
                    if (!e.target.checked) {
                      setAgreeToRisks(false);
                    }
                  }}
                  className="mt-1 w-4 h-4 text-primary-bright bg-gray-100 border-gray-300 rounded focus:ring-primary-bright focus:ring-2"
                />
                <label htmlFor="rememberMe" className="font-sans text-small text-neutral-dark dark:text-neutral-medium">
                  Remember me on this device
                </label>
              </div>

              {/* Security Warning - Only show when Remember Me is checked */}
              {rememberMe && (
                <div className="p-4 bg-accent-warning/10 border border-accent-warning/30 rounded-lg">
                  <div className="flex items-start space-x-3 mb-3">
                    <TriangleAlert className="w-5 h-5 text-accent-warning mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-sans font-medium text-accent-warning mb-2">
                        Security Risk Warning
                      </h4>
                      <ul className="space-y-1 font-sans text-small text-neutral-dark dark:text-neutral-medium">
                        <li>• <strong>Compromises zero-knowledge security</strong> on this device</li>
                        <li>• Your encryption key will be stored in browser's IndexedDB</li>
                        <li>• Anyone with access to this browser can access your data</li>
                        <li>• Potential exposure through browser vulnerabilities (XSS attacks)</li>
                        <li>• Only use on trusted, personal devices</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="agreeToRisks"
                      checked={agreeToRisks}
                      onChange={(e) => setAgreeToRisks(e.target.checked)}
                      className="mt-1 w-4 h-4 text-accent-warning bg-gray-100 border-gray-300 rounded focus:ring-accent-warning focus:ring-2"
                    />
                    <label htmlFor="agreeToRisks" className="font-sans text-small text-neutral-dark dark:text-neutral-medium">
                      <strong>I understand and acknowledge these security risks</strong>
                    </label>
                  </div>
                </div>
              )}
            </div>
            <Button
              variant="primary"
              size="large"
              className="w-full"
              type="submit"
              disabled={
                isLoading || 
                password.length < 8 || 
                (rememberMe && !agreeToRisks)
              }
            >
              {isLoading ? (
                'Deriving encryption key...'
              ) : (
                isFirstTime ? 'Create & Encrypt Vault' : 'Unlock Vault'
              )}
            </Button>
          </form>
        </Card>

        {/* Password Reset Confirmation Dialog */}
        {showResetDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-error/10 rounded-lg mb-6">
                  <AlertTriangle className="w-8 h-8 text-accent-error" />
                </div>
                
                <h3 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-4 uppercase tracking-wide">
                  Incorrect Password
                </h3>
                
                <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium mb-6 leading-relaxed">
                  The master password you entered is incorrect and cannot decrypt your existing promo codes.
                </p>
                
                <p className="font-sans text-small text-neutral-medium mb-8">
                  Would you like to reset your master password? <strong className="text-accent-error">This will permanently delete all your existing promo codes.</strong>
                </p>
                
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    size="medium"
                    className="flex-1"
                    onClick={handleResetCancel}
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="primary"
                    size="medium"
                    className="flex-1 bg-accent-error hover:bg-accent-error/90"
                    onClick={handleResetConfirm}
                  >
                    Reset Password
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterPasswordInput;