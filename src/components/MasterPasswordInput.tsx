import React, { useState } from 'react';
import { Shield, Lock, AlertCircle, Eye, EyeOff, TriangleAlert } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';

interface MasterPasswordInputProps {
  onPasswordSubmit: (password: string, rememberMe?: boolean) => Promise<void>;
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
  const [rememberMe, setRememberMe] = useState(false);
  const [acknowledgeRisk, setAcknowledgeRisk] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      await onPasswordSubmit(password, rememberMe);
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
              disabled={
                isLoading || 
                password.length < 8 || 
                (rememberMe && !acknowledgeRisk)
              }
            >
              {isLoading ? (
                'Deriving encryption key...'
              ) : (
                isFirstTime ? 'Create & Encrypt Vault' : 'Unlock Vault'
              )}
            </Button>
          </form>

          {/* Remember Me Option */}
          <div className="mt-6 space-y-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => {
                  setRememberMe(e.target.checked);
                  if (!e.target.checked) {
                    setAcknowledgeRisk(false);
                  }
                }}
                className="mt-1 w-4 h-4 text-primary-bright bg-gray-100 border-gray-300 rounded focus:ring-primary-bright focus:ring-2"
              />
              <label htmlFor="rememberMe" className="font-sans text-small text-neutral-dark dark:text-neutral-medium text-left">
                Remember me on this device
                <span className="block text-neutral-medium mt-1">
                  Store encryption key locally for convenience
                </span>
              </label>
            </div>

            {/* Security Warning when Remember Me is enabled */}
            {rememberMe && (
              <div className="p-4 bg-accent-warning/10 border border-accent-warning/30 rounded-lg">
                <div className="flex items-start space-x-3 mb-3">
                  <TriangleAlert className="w-6 h-6 text-accent-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-sans font-bold text-accent-warning mb-2">
                      ⚠️ Security Warning
                    </h4>
                    <div className="font-sans text-small text-neutral-dark dark:text-neutral-medium space-y-2">
                      <p>
                        <strong>Enabling this option compromises zero-knowledge security on this device.</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Your encryption key will be stored in your browser's IndexedDB</li>
                        <li>Anyone with access to your browser can potentially access your data</li>
                        <li>Browser vulnerabilities (XSS attacks) could expose your stored key</li>
                        <li>We recommend only using this on trusted, personal devices</li>
                      </ul>
                      <p className="font-medium text-accent-warning">
                        This is a convenience vs. security trade-off. Your data will no longer be truly zero-knowledge on this device.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Risk Acknowledgment */}
                <div className="flex items-start space-x-3 pt-3 border-t border-accent-warning/20">
                  <input
                    type="checkbox"
                    id="acknowledgeRisk"
                    checked={acknowledgeRisk}
                    onChange={(e) => setAcknowledgeRisk(e.target.checked)}
                    className="mt-1 w-4 h-4 text-accent-warning bg-gray-100 border-gray-300 rounded focus:ring-accent-warning focus:ring-2"
                  />
                  <label htmlFor="acknowledgeRisk" className="font-sans text-small text-neutral-dark dark:text-neutral-medium text-left">
                    <strong>I understand the security risks</strong> and choose convenience over maximum security on this device.
                  </label>
                </div>
              </div>
            )}
          </div>

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
          <div className={`${rememberMe ? 'mt-4' : 'mt-8'} p-4 bg-primary-bright/10 border border-primary-bright/20 rounded-lg text-left`}>
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-primary-bright mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-sans font-medium text-primary-bright mb-2">
                  {rememberMe ? 'Standard Security Notice' : 'Zero-Knowledge Security'}
                </h4>
                <ul className="space-y-1 font-sans text-small text-neutral-dark dark:text-neutral-medium">
                  <li>• {rememberMe ? 'Your master password still never leaves this device' : 'Your master password never leaves this device'}</li>
                  <li>• We cannot recover your password if you forget it</li>
                  <li>• All encryption happens locally in your browser</li>
                  {rememberMe && (
                    <li className="text-accent-warning">• Your derived encryption key will be stored locally</li>
                  )}
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