'use client';

import { signOut } from "next-auth/react";

export default function SignOutPage() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '24px',
          color: '#333'
        }}>Αποσύνδεση</h1>
        
        <p style={{
          marginBottom: '24px',
          color: '#555'
        }}>Είστε σίγουροι ότι θέλετε να αποσυνδεθείτε;</p>
        
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{
              backgroundColor: '#646cff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              flex: 1
            }}
          >
            Ναι
          </button>
          
          <button
            onClick={() => window.history.back()}
            style={{
              backgroundColor: '#f0f0f0',
              color: '#333',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              flex: 1
            }}
          >
            Ακύρωση
          </button>
        </div>
      </div>
    </div>
  );
}
