'use client';

import React, { useState } from 'react';

interface RegisterFormProps {
  onSuccess?: () => void;
  onToggleForm?: () => void;
}

// Placeholder — registration not available on admin-only platform
export default function RegisterForm({ onSuccess, onToggleForm }: RegisterFormProps) {
  const isLoading = false;
  const error: string | null = null;
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [formError, setFormError] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setFormError('');
    
    // Real-time password confirmation validation
    if (name === 'password' || name === 'confirmPassword') {
      const password = name === 'password' ? value : formData.password;
      const confirmPassword = name === 'confirmPassword' ? value : formData.confirmPassword;
      setPasswordMatch(password === confirmPassword || confirmPassword === '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      setPasswordMatch(false);
      return;
    }
    
    try {
      throw new Error('Registration is not available — admin-only platform.');
      onSuccess?.();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="gov-label">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            required
            value={formData.firstName}
            onChange={handleChange}
            className="gov-input mt-1"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="gov-label">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            required
            value={formData.lastName}
            onChange={handleChange}
            className="gov-input mt-1"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="gov-label">
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="gov-input mt-1"
        />
      </div>

      <div>
        <label htmlFor="phone" className="gov-label">
          Phone (Optional)
        </label>
        <input
          type="tel"
          name="phone"
          id="phone"
          value={formData.phone}
          onChange={handleChange}
          className="gov-input mt-1"
        />
      </div>

      <div>
        <label htmlFor="password" className="gov-label">
          Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          required
          minLength={8}
          value={formData.password}
          onChange={handleChange}
          className="gov-input mt-1"
        />
        <p className="mt-1 text-sm text-gray-500">Minimum 8 characters</p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="gov-label">
          Confirm Password
        </label>
        <input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`gov-input mt-1 ${
            passwordMatch ? '' : 'border-red-300'
          }`}
        />
        {!passwordMatch && (
          <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
        )}
        {passwordMatch && formData.confirmPassword && (
          <p className="mt-1 text-sm font-semibold text-black">Passwords match</p>
        )}
      </div>

      {(formError || error) && (
        <div className="text-red-600 text-sm">
          {formError || error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !passwordMatch}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-[#262522] disabled:opacity-50"
      >
        {isLoading ? 'Creating account...' : 'Create account'}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={onToggleForm}
          className="text-black hover:text-[#9a0d1c] text-sm"
        >
          Already have an account? Sign in
        </button>
      </div>
    </form>
  );
}