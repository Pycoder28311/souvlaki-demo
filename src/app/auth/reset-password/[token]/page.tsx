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
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleResetPassword}>
        <div>
          <label htmlFor="newPassword">New Password</label>
          <div className="password-input-container">
            <input
              type={showNewPassword ? 'text' : 'password'} // Toggle between 'text' and 'password'
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)} // Toggle password visibility
            >
              {showNewPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="password-input-container">
            <input
              type={showConfirmPassword ? 'text' : 'password'} // Toggle between 'text' and 'password'
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)} // Toggle password visibility
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        
        {!emailSent && !message.includes('Password successfully reset') && (
          <div>
            <p>If you did not receive the reset email, you can click Reset Password button again.</p>
          </div>
        )}
        <button type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
        {error && <div style={{ color: "red" }}>{error}</div>}
      </form>
    </div>
  );
};

export default ResetPassword;
