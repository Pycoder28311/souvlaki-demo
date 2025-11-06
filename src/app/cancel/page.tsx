import Link from "next/link";
import React from "react";

export default function CancelPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#fff3f3",
      }}
    >
      <h1 style={{ color: "#dc3545", fontSize: "2.5rem", marginBottom: "20px" }}>
        Η πληρωμή ακυρώθηκε
      </h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>
        Η πληρωμή σας δεν ολοκληρώθηκε. Δεν χρεώθηκε τίποτα στον λογαριασμό σας.
      </p>
      <p style={{ fontSize: "1rem", marginBottom: "30px" }}>
        Μπορείτε να επιστρέψετε στην αρχική σελίδα και να δοκιμάσετε ξανά.
      </p>
      <Link href="/">
        <button
          style={{
            padding: "10px 25px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Επιστροφή στην αρχική
        </button>
      </Link>
    </div>
  );
}
