import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import EmailVerificationForm from './EmailVerificationForm';
import GoogleSignInButton from './GoogleSignInButton';

const AuthModal = ({ isOpen, onClose, defaultTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { 
    loading, 
    pendingVerification, 
    verifyEmail, 
    googleSignIn, 
    resendVerificationCode, 
    clearVerification 
  } = useAuth();

  // Switch to verification mode when verification is pending
  useEffect(() => {
    if (pendingVerification) {
      setActiveTab('verification');
    }
  }, [pendingVerification]);

  if (!isOpen) return null;

  const handleSuccess = () => {
    if (pendingVerification) {
      setActiveTab('verification');
    } else {
      onClose();
    }
  };

  const handleVerificationSuccess = async (code) => {
    await verifyEmail(code);
    onClose();
  };

  const handleGoogleSuccess = async (credential) => {
    await googleSignIn(credential);
    if (pendingVerification) {
      setActiveTab('verification');
    } else {
      onClose();
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google Sign-In Error:', error);
  };

  const handleBackToAuth = () => {
    clearVerification();
    setActiveTab('login');
  };

  const renderAuthForms = () => {
    if (activeTab === 'verification') {
      return (
        <div>
          <EmailVerificationForm
            email={pendingVerification?.email}
            type={pendingVerification?.type}
            onVerificationSuccess={handleVerificationSuccess}
            onResendCode={resendVerificationCode}
            loading={loading}
          />
          <div className="mt-4 text-center">
            <button
              onClick={handleBackToAuth}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              ← Back to sign in
            </button>
          </div>
        </div>
      );
    }

    return (
      <div>
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              activeTab === 'login'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('login')}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              activeTab === 'register'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('register')}
          >
            Create Account
          </button>
        </div>

        {/* Google Sign-In */}
        <div className="mb-6">
          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            disabled={loading}
          />
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>
        </div>

        {/* Auth Forms */}
        {activeTab === 'login' ? (
          <LoginForm
            onSuccess={handleSuccess}
            onToggleForm={() => setActiveTab('register')}
          />
        ) : (
          <RegisterForm
            onSuccess={handleSuccess}
            onToggleForm={() => setActiveTab('login')}
          />
        )}
      </div>
    );
  };

  const getTitle = () => {
    if (activeTab === 'verification') {
      return pendingVerification?.type === 'registration' 
        ? 'Verify Your Account' 
        : 'Verify Sign In';
    }
    return activeTab === 'login' ? 'Welcome Back' : 'Create Account';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {getTitle()}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-light"
              disabled={loading}
            >
              ×
            </button>
          </div>

          {renderAuthForms()}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;