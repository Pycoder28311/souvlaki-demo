'use client'

import { signIn } from "next-auth/react";
import Link from "next/link";
import styles from '../Auth.module.css';
import { FcGoogle } from "react-icons/fc";
import { googleButtonClasses } from "../buttonStyles";

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
            className={googleButtonClasses}
          >
            Σύνδεση
          </button>
        </form>

        <div className={styles.links}>
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className={googleButtonClasses}
            style={{width: '100%'}}
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
