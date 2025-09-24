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
        <h1 className={styles.title}>Sign In</h1>
        
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className={styles.input}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className={styles.input}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button type="submit" className={styles.submitButton}>
            Log In
          </button>
        </form>

        <div className={styles.links}>
          <Link href="/auth/sign-up" className={styles.link}>
            Dont have an account? <span>Sign Up</span>
          </Link>
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
              className={styles.link}
          >
            <FcGoogle className="w-5 h-5" />
            Sign in with Google
          </button>
          <Link href="/auth/email-reset-input" className={styles.link}>
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
}
