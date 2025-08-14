import React, { useState } from 'react';
import { Shield, Lock, AlertCircle, Eye, EyeOff, AlertTriangle as TriangleAlert } from 'lucide-react';
import Input from './ui/Input';
import Card from './ui/Card';

interface MasterPasswordInputProps {
  onPasswordSubmit: (password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const MasterPasswordInput: React.FC<MasterPasswordInputProps> = ({
  onPasswordSubmit,
  isLoading,
  error
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      await onPasswordSubmit(password);
    }
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

          {error && (
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

            <Button
              variant="primary"
              size="large"
              className="w-full"
              type="submit"
              disabled={isLoading || password.length < 8}
            >
              {isLoading ? (
                'Deriving encryption key...'
              ) : (
                isFirstTime ? 'Create & Encrypt Vault' : 'Unlock Vault'
              )}
            </Button>
          </form>

          {/* Toggle between first time and returning user */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setIsFirstTime(!isFirstTime)}
              className="font-sans text-small text-primary-bright hover:text-primary-deep transition-colors duration-200"
            >
              {isFirstTime 
                ? 'Already have a master password? Sign in' 
                : 'First time? Create master password'
              }
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-primary-bright/10 border border-primary-bright/20 rounded-lg text-left">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-primary-bright mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-sans font-medium text-primary-bright mb-2">
                  Zero-Knowledge Security
                </h4>
                <ul className="space-y-1 font-sans text-small text-neutral-dark dark:text-neutral-medium">
                  <li>• Your master password never leaves this device</li>
                  <li>• We cannot recover your password if you forget it</li>
                  <li>• All encryption happens locally in your browser</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MasterPasswordInput;