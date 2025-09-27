'use client'

import { signIn } from "next-auth/react";
import Link from "next/link";
import styles from '../Auth.module.css';
import { FcGoogle } from "react-icons/fc";

export default function SignIn() {
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = e.currentTarget.email.value;
    const password = e.currentTarget.password.value;

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      alert("Invalid credentials");
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Σύνδεση</h1>
        
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className={styles.input}
              placeholder="Email"
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Κωδικός</label>
            <input
              type="password"
              id="password"
              name="password"
              className={styles.input}
              placeholder="Κωδικός"
              required
            />
          </div>
          
          <button
            type="submit"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 16px',
              backgroundColor: '#646cff', // main color
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '6px',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s, transform 0.1s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#4f55e1';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#646cff';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
          >
            Σύνδεση
          </button>
        </form>

        <div className={styles.links}>
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              gap: '6px',
              padding: '10px 16px',
              backgroundColor: '#646cff', // main color
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '6px',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s, transform 0.1s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#4f55e1';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#646cff';
              (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            }}
          >
            <FcGoogle className="w-5 h-5" />
            Σύνδεση με Google
          </button>

          <Link href="/auth/signup" className={styles.link}>
            Δεν έχετε λογαριασμό; <span>Εγγραφή</span>
          </Link>

          <Link href="/auth/email-reset-input" className={styles.link}>
            Ξεχάσατε τον κωδικό;
          </Link>
        </div>
      </div>
    </div>
  );
}
