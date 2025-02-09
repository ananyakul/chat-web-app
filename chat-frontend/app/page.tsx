'use client';

import Image from 'next/image';
import { ChatCircleDots } from "@phosphor-icons/react";
import Sidebar from '@/components/Sidebar';

const Home = () => {
  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <Sidebar/>

      {/* Landing Page */}
      <div style={styles.mainContent}>
        <h1 style={styles.welcomeTitle}>Welcome to Ananya&apos;s Chat App
          <span style={styles.iconWrapper}>
            <Image src="/logo.png" alt="Logo Icon" width={30} height={30} />
          </span>  
        </h1>
        <div style={styles.instructions}>
          Select a chat from the sidebar or click  
            <span style={styles.iconWrapper}>
              <ChatCircleDots size={20} color="#ffffff" weight="bold" />
            </span>  
           to create a new one.
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: "'Inter', sans-serif",
    color: '#fff',
    backgroundColor: '#222',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    backgroundColor: '#222',
  },
  welcomeTitle: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#ddd',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
  },
  instructions: {
      fontSize: '16px',
      color: '#aaa',
      maxWidth: '60%',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
  },
  iconWrapper: {
      display: 'inline-flex',
      alignItems: 'center',

  },
};

export default Home;
