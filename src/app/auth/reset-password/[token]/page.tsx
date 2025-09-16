'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // useParams hook for accessing dynamic route params
import { validatePassword } from "../../../utils/validatePassword";

const ResetPassword = () => {
  const { token } = useParams() ?? {};// Access the token directly from the params

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // State variables for showing/hiding passwords
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage('Invalid or expired reset token.');
    }
  }, [token]);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    if (!validatePassword(newPassword)) {
      setError(
        "Password must be at least 8 characters long, contain at least one number and one special character."
      );
      return;
    } else {
      setError("");
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password: newPassword }),
      });
      setEmailSent(true)

      if (res.ok) {
        setMessage('Password successfully reset. You can now log in.');
      } else {
        const data = await res.json();
        setMessage(`Error: ${data.message || 'Failed to reset password'}`);
      }
    } catch (error) {
      console.error(error);
      setMessage('An unexpected error occurred.');
    }

    setLoading(false);
  };

  // Show a loading state if the token is not yet available
  if (!token) {
    return <p>Loading...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Reset Password</h2>

        {message && (
          <p className="text-center text-green-600 font-medium">{message}</p>
        )}

        <form onSubmit={handleResetPassword} className="space-y-5">
          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-1">
              New Password
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="flex-1 px-4 py-2 focus:outline-none"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
              >
                {showNewPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-1">
              Confirm Password
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="flex-1 px-4 py-2 focus:outline-none"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Info message */}
          {!emailSent && !message.includes('Password successfully reset') && (
            <div className="text-sm text-gray-500">
              If you did not receive the reset email, you can click the Reset Password button again.
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          {/* Error message */}
          {error && <div className="text-red-600 font-medium text-center">{error}</div>}
        </form>
      </div>
    </div>

  );
};

export default ResetPassword;
