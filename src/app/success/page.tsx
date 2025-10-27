"use client";

import Link from "next/link";
import React from "react";
import { useEffect } from "react";

export default function SuccessPage() {
  useEffect(() => {
    const createOrder = async () => {
      await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: sessionStorage.getItem("lastOrder"), // use temp saved order data
      });
      sessionStorage.removeItem("lastOrder");
    };

    // get last order from storage
    createOrder();
  }, []);

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
        backgroundColor: "#f8f9fa",
      }}
    >
      <h1 style={{ color: "#28a745", fontSize: "2.5rem", marginBottom: "20px" }}>
        Η παραγγελία σας στάλθηκε επιτυχώς!
      </h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>
        Ευχαριστούμε για την παραγγελία σας.
      </p>
      <p style={{ fontSize: "1rem", marginBottom: "30px" }}>
        Μπορείτε να επιστρέψετε στην αρχική σελίδα για να συνεχίσετε τις αγορές σας.
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
