import React, { useState } from 'react';
import { Shield, Chrome, AlertCircle, Github, Slack } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { authService } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await authService.signInWithOAuth('google');
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await authService.signInWithOAuth('github');
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with GitHub');
    } finally {
      setLoading(false);
    }
  };

  const handleSlackSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await authService.signInWithOAuth('slack_oidc');
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Slack');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-bright rounded-lg mb-6 shadow-light dark:shadow-dark animate-pulse-glow">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-pixel text-h3 text-neutral-dark dark:text-white mb-2 uppercase tracking-wide">
          Welcome
        </h2>
        <p className="font-sans text-body text-neutral-dark dark:text-neutral-medium">
          Sign in to access your encrypted vault
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

      {/* OAuth Buttons */}
      <div className="mb-6 space-y-3">
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
        <Button
          variant="secondary"
          size="large"
          className="w-full border-2 border-neutral-medium hover:border-primary-bright"
          onClick={handleGitHubSignIn}
          disabled={loading}
        >
          <Github className="w-5 h-5 mr-3" />
          Continue with GitHub
        </Button>
        <Button
          variant="secondary"
          size="large"
          className="w-full border-2 border-neutral-medium hover:border-primary-bright"
          onClick={handleSlackSignIn}
          disabled={loading}
        >
          <Slack className="w-5 h-5 mr-3" />
          Continue with Slack
        </Button>
      </div>
    </Modal>
  );
};

export default AuthModal;