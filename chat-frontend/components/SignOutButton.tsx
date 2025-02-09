"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const SignOutButton = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found, redirecting to login.");
        router.push("/");
        return;
      }

      const response = await fetch(`${BACKEND_URL}/signout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log("Signout successful.");
        localStorage.removeItem("token");
        router.push("/");
      } else {
        console.error("Error signing out:", await response.text());
      }
    } catch (error) {
      console.error("Signout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleSignOut} style={styles.signoutButton} disabled={loading}>
      {loading ? "Signing Out..." : "Sign Out"}
    </button>
  );
};

export default SignOutButton;

const styles = {
  signoutButton: {
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer",
    border: "none",
    backgroundColor: "#ef4444",
    marginTop: "1rem",
  },
};