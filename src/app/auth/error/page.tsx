'use client';

import { useRouter } from 'next/navigation';

export default function ErrorPage() {
  const router = useRouter();
  
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
          There was an issue with your authentication. Please try again.
        </p>
        
        <button 
          onClick={() => router.push('/auth/signin')}
          style={{
            backgroundColor: '#dc3545',
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
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#bb2d3b'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
        >
          Go to Sign In
        </button>
      </div>
    </div>
  );
}
