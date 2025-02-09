"use client"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const SignupPage: FC = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
    
        const response = await fetch(`${BACKEND_URL}/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
    
        const data = await response.json();
    
        if (response.ok) {
          router.push("/login"); // Redirect to login after signup
        } else {
          setError(data.detail || "Signup failed");
        }
    };
    
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Sign Up</h2>
        <form onSubmit={handleSignup} style={styles.form}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email}  
            onChange={(e) => setEmail(e.target.value)} 
            style={{...styles.input, color: "black"}} 
            required />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{...styles.input, color: "black"}} 
            required />
          <button type="submit" style={styles.signupButton}>Sign Up</button>
        </form>
        {error && <p style={styles.error}>{error}</p>}
        <p style={styles.text}>Already have an account? <Link href="/login" style={styles.link}>Login</Link></p>
      </div>
    );
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      backgroundColor: "#222",
    },
    title: {
      display: 'flex',
      fontSize: "2rem",
      fontWeight: "bold",
      marginBottom: "1rem",
      alignItems: 'center',
      gap: '10px',
    },
    subtitle: {
      fontSize: "1.2rem",
      marginBottom: "1.5rem",
    },
    buttonContainer: {
      display: "flex",
      gap: "1rem",
    },
    loginButton: {
      padding: "0.75rem 1.5rem",
      fontSize: "1rem",
      borderRadius: "8px",
      color: "white",
      cursor: "pointer",
      border: "none",
      backgroundColor: "#2563eb",
    },
    signupButton: {
      padding: "0.75rem 1.5rem",
      fontSize: "1rem",
      borderRadius: "8px",
      color: "white",
      cursor: "pointer",
      border: "none",
      backgroundColor: "#10b981",
    },
    loginButtonHover: {
      backgroundColor: "#1d4ed8",
    },
    signupButtonHover: {
      backgroundColor: "#059669",
    },
    iconWrapper: {
      display: 'inline-flex',
      alignItems: 'center',
  
    },  
    form: {
        display: "flex",
        flexDirection: "column",
        width: "300px",
    },
    input: {
        padding: "0.5rem",
        marginBottom: "1rem",
        border: "1px solid #ddd",
        borderRadius: "5px",
    },
    text: {
        marginTop: "1rem",
    },
    link: {
        color: "#2563eb",
        cursor: "pointer",
    },
    error: {
        color: "red",
        fontSize: "0.9rem",
        marginTop: "10px",
      },
  }

  export default SignupPage;
  