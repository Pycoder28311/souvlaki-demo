"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { validatePassword } from "../../utils/validatePassword";
import styles from '../Auth.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Check if password meets the criteria
    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters long, contain at least one number and one special character."
      );
      return;
    } else {
      setError("");
    }

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (data.error) {
      setError(data.error);
    } else {
      // Automatically sign in the user after successful signup
      const signInResponse = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInResponse?.error) {
        setError("Failed to sign in. Please try signing in manually.");
      } else {
        // Redirect to the home page or wherever you want
        window.location.href = "/";
      }
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Sign Up</h1>
        
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.inputLabel}>Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.inputField}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.inputLabel}>Password</label>
            <div className={styles.passwordInput}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputField}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={styles.toggleButton}
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.inputLabel}>Confirm Password</label>
            <div className={styles.passwordInput}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.inputField}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className={styles.toggleButton}
              >
                {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.inputLabel}>Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.inputField}
              placeholder="Enter your name"
              required
            />
          </div>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <button type="submit" className={styles.primaryButton}>
            Sign Up
          </button>
        </form>
        
        <div className={styles.authLinks}>
          <div className={styles.signinPrompt}>
            Already have an account?{' '}
            <Link href="/auth/signin" className={styles.signinLink}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
    
  );
}
