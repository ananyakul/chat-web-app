import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './Chat'; // Import our Chat component

// function App() {
//   return (s
//     <Router>
//       <Routes>
//         <Route path="/" element={<Chat />} />
//         <Route path="/chat/:chatId" element={<Chat />} />
//       </Routes>
//     </Router>
//   );
// }

function Home() {
  return <h1>Home Page</h1>;
}

function About() {
  return <h1>About Page</h1>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;


// import React from 'react';

// function App() {
//   return <h1>Hello, React is Working!</h1>;
// }

// export default App;

