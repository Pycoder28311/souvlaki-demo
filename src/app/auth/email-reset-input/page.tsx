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
        setMessage('Το email επαναφοράς κωδικού στάλθηκε. Ελέγξτε τα εισερχόμενά σας.');
      } else {
        const data = await res.json();
        setMessage(`Σφάλμα: ${data.message || 'Αποτυχία αποστολής email επαναφοράς'}`);
      }
    } catch (error) {
      console.error(error);
      setMessage('Παρουσιάστηκε απροσδόκητο σφάλμα.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Επαναφορά Κωδικού</h1>
        
        {message && (
          <div className={`${styles.message}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleResetPassword} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Διεύθυνση Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="Εισάγετε το email σας"
              required
            />
          </div>
          
          <button type="submit" className={styles.submitButton}>
            Αποστολή Συνδέσμου Επαναφοράς
          </button>
        </form>
      </div>
    </div>
  );
}
