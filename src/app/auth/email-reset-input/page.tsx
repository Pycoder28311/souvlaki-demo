'use client';

import { useState } from 'react';
import styles from '../Confirm.module.css';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/auth/send-reset-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setMessage('Password reset email sent. Check your inbox.');
      } else {
        const data = await res.json();
        setMessage(`Error: ${data.message || 'Failed to send reset email'}`);
      }
    } catch (error) {
      console.error(error);
      setMessage('An unexpected error occurred.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Reset Password</h1>
        
        {message && (
          <div className={`${styles.message}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleResetPassword} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <button type="submit" className={styles.submitButton}>
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}
