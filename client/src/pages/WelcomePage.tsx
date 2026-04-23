import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/welcome.css";

// const WelcomePage: React.FC = () => {
//   return (
//     <main className="welcome-container" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
//        <div>
//             <h1 className="welcome-title">Welcome to ColorGrid</h1>
//             <p className="welcome-subtitle">A real‑time, multiplayer grid conquest game.</p>
//             <div className="welcome-buttons">
//                 <Link to="/login" className="btn btn-primary">Login</Link>
//                 <Link to="/signup" className="btn btn-secondary">Sign Up</Link>
//             </div>
//         </div>
//     </main>
//   );
// };

// export default WelcomePage;


const WelcomePage: React.FC = () => {
    return (
        <main className="welcome-container">
            <h1 className="welcome-title">Island Conquest</h1>
            <p className="welcome-subtitle">A real-time multiplayer grid conquest game.</p>
            <div className="welcome-buttons">
                <Link to="/login" className="btn btn-primary">Login</Link>
                <Link to="/signup" className="btn btn-secondary">Sign Up</Link>
            </div>
        </main>
    );
  };
  
  export default WelcomePage;