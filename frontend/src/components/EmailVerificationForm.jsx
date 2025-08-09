import React, { useState, useEffect } from 'react';

const EmailVerificationForm = ({ 
  email, 
  type = 'registration', 
  onVerificationSuccess, 
  onResendCode,
  loading = false 
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setError('');
    try {
      await onVerificationSuccess?.(verificationCode);
    } catch (err) {
      setError(err.message || 'Invalid verification code');
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    try {
      await onResendCode?.();
      setTimeRemaining(600);
      setCanResend(false);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
    if (error) setError('');
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {type === 'registration' ? 'Verify Your Email' : 'Verify Login'}
        </h2>
        <p className="text-gray-600 mt-2">
          We've sent a 6-digit verification code to
        </p>
        <p className="font-medium text-blue-600">{email}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="verificationCode" className="sr-only">
            Verification Code
          </label>
          <input
            type="text"
            name="verificationCode"
            id="verificationCode"
            value={verificationCode}
            onChange={handleCodeChange}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 text-center text-2xl tracking-widest focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            autoComplete="one-time-code"
            disabled={loading}
          />
          <p className="mt-2 text-sm text-gray-500 text-center">
            Enter the 6-digit code from your email
          </p>
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {timeRemaining > 0 && (
          <div className="text-center text-sm text-gray-600">
            Code expires in {formatTime(timeRemaining)}
          </div>
        )}

        <div className="space-y-4">
          <button
            type="submit"
            disabled={loading || verificationCode.length !== 6}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                Verifying...
              </div>
            ) : (
              'Verify Code'
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={!canResend || loading}
                className={`font-medium ${
                  canResend && !loading
                    ? 'text-blue-600 hover:text-blue-500 cursor-pointer'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                {canResend ? 'Resend code' : `Resend (${formatTime(timeRemaining)})`}
              </button>
            </p>
          </div>
        </div>
      </form>

      <div className="mt-6 text-center text-xs text-gray-500">
        <p>Check your spam folder if you don't see the email</p>
      </div>
    </div>
  );
};

export default EmailVerificationForm;