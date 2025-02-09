import Link from "next/link";
import { FC } from "react";
import Image from 'next/image';

const LandingPage: FC = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to Ananya's Chat App
        <span style={styles.iconWrapper}>
              <Image src="/logo.png" alt="Logo Icon" width={35} height={35} />
        </span> 
      </h1>
      <p style={styles.subtitle}>Begin by logging in if you already have an account, or sign up if you're new.</p>
      <div style={styles.buttonContainer}>
        <Link href="/login"><button style={styles.loginButton}>Login</button></Link>
        <Link href="/signup"><button style={styles.signupButton}>Sign Up</button></Link>
      </div>
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
}

export default LandingPage;

