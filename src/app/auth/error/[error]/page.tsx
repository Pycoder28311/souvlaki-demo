'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';

export default function ErrorPage() {
  const router = useRouter();
  const { error } = useParams() ?? {};

  // Default message if error is undefined or unknown
  let message = "There was an issue with your authentication. Please try again.";

  if (error === "ExistingUser") {
    message = "An account with this email already exists. Please use your original sign-in method.";
  } else if (error === "OAuthCreateAccount") {
    message = "We couldn't create an account for you. Please try again.";
  } else if (error === "OAuthCallback") {
    message = "Authentication failed during the OAuth process. Please try again.";
  }

  const [hover, setHover] = useState(false);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        width: '100%',
        maxWidth: '500px'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '16px',
          color: '#dc3545'
        }}>
          Something went wrong!
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: '#6c757d',
          marginBottom: '32px',
          lineHeight: '1.5'
        }}>
          {message}
        </p>
        
        <button 
          onClick={() => router.replace('/auth/signin')} // replace prevents back button issues
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            backgroundColor: hover ? '#bb2d3b' : '#dc3545',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            width: '100%',
            maxWidth: '200px',
            margin: '0 auto',
            display: 'block'
          }}
        >
          Go to Sign In
        </button>
      </div>
    </div>
  );
}
