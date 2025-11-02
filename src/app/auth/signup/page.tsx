"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { validatePassword } from "../../utils/validatePassword";
import styles from '../Auth.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from "react-icons/fc";
import { googleButtonClasses } from "../buttonStyles";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getUserAddress = async () => {
    if (!navigator.geolocation) {
      return null;
    }

    return new Promise<{ address: string; distanceText: string; distanceValue: number } | null>(
      (resolve) => {
        navigator.geolocation.getCurrentPosition(async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            const resGeo = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&language=el&key=${process.env.NEXT_PUBLIC_GEOLOCATION_API}`
            );

            const dataGeo = await resGeo.json();
            const userAddress = dataGeo.results?.[0]?.formatted_address || "";

            if (!dataGeo) {
              resolve({ address: userAddress, distanceText: "", distanceValue: 0 });
              return;
            }

            if (email === "kopotitore@gmail.com") {
              resolve({ address: userAddress, distanceText: "", distanceValue: 0 });
              return;
            }

            // Distance Matrix API call
            const distanceRes = await fetch("/api/get-distance", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ origin: userAddress }),
            });

            const dataDist = await distanceRes.json();
            const element = dataDist.rows?.[0]?.elements?.[0];

            if (element?.status === "OK") {
              resolve({
                address: userAddress,
                distanceText: element.distance.text,
                distanceValue: element.distance.value,
              });
            } else {
              resolve({ address: userAddress, distanceText: "", distanceValue: 0 });
            }
          } catch (err) {
            console.error(err);
            resolve(null);
          }
        }, (err) => {
          console.error(err);
          resolve(null);
        });
      }
    );
  };

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

    const result = await getUserAddress();

    if (!result) {
      console.error("Δεν μπορέσαμε να βρούμε την απόσταση από το μαγαζί!");
      return;
    }

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        name,
        address: result.address,         // user’s formatted address
        distanceToDestination: result.distanceValue, // in meters
      }),
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
        <h1 className={styles.authTitle}>Εγγραφή</h1>
        
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
            <label htmlFor="password" className={styles.inputLabel}>Κωδικός</label>
            <div className={styles.passwordInput}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputField}
                placeholder="Εισάγετε τον κωδικό σας"
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
            <label htmlFor="confirmPassword" className={styles.inputLabel}>Επιβεβαίωση Κωδικού</label>
            <div className={styles.passwordInput}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.inputField}
                placeholder="Επιβεβαίωση Κωδικού"
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
            <label htmlFor="name" className={styles.inputLabel}>Όνομα</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.inputField}
              placeholder="Όνομα"
              required
            />
          </div>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <button type="submit" className={googleButtonClasses}>
            Εγγραφή
          </button>
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className={googleButtonClasses}
          >
            <FcGoogle className="w-5 h-5" />
            Σύνδεση με Google
          </button>
        </form>
        
        <div className={styles.authLinks}>
          <div className={styles.signinPrompt}>
            Έχετε ήδη λογαριασμό?{' '}
            <Link href="/auth/signin" className={styles.signinLink}>
              Συνδεθείτε
            </Link>
          </div>
        </div>
      </div>
    </div>
    
  );
}
