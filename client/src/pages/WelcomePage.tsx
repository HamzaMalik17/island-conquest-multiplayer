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
        <><div className="background-crowns">
            <span className="crown crown1">👑</span>
            <span className="crown crown2">👑</span>
            <span className="crown crown3">👑</span>
            <span className="crown crown4">👑</span>
            <span className="crown crown5">👑</span>
            <span className="crown crown6">👑</span>
            <span className="crown crown7">👑</span>
            <span className="crown crown8">👑</span>
            <span className="crown crown9">👑</span>
            <span className="crown crown10">👑</span>
        </div><div className="welcome-container">
                <h1 className="title">DARBAAR</h1>
                <p className="subtitle">Find The WAZIR!</p>
                <div className="button-group">
                    <Link to="/login" className="btn btn-primary">LOGIN</Link>
                    <Link to="/signup" className="btn btn-secondary">SIGNUP</Link>
                </div>
            </div></>
    );
  };
  
  export default WelcomePage;