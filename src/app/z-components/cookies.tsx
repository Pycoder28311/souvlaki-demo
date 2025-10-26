// src/components/CookieConsent.js
'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user already accepted
    fetch('/api/cookies')
      .then((res) => res.json())
      .then((data) => {
        if (data.accepted !== 'true') {
          setShowBanner(true);
        }
      });
  }, []);

  const acceptCookies = async () => {
    await fetch('/api/cookies', {
        method: 'POST',
        body: JSON.stringify({ accepted: true }),
    });
    setShowBanner(false);
    };

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      width: '100%',
      background: '#333',
      color: '#fff',
      padding: '1rem',
      textAlign: 'center',
      zIndex: 1000
    }}>
      <span>We use cookies to improve your experience. </span>
      <button
        onClick={acceptCookies}
        style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}
      >
        Accept
      </button>
    </div>
  );
}
