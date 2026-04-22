import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { disconnectSocket } from '../services/socketService'; 

interface NavbarProps {
    user: {
        _id: string;
        username: string;
        coins: number;
        profile_picture_url?: string;
    }
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
    const { logout: contextLogout, updateUserCoins } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const defaultProfilePic = "https://th.bing.com/th/id/OIP.eMLmzmhAqRMxUZad3zXE5QHaHa?rs=1&pid=ImgDetMain"; 

    const handleLogout = () => {
        contextLogout();
        disconnectSocket(); 
        navigate('/'); 
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    // Minimal inline styles matching the CSS structure from design files
    const navbarStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 2rem',
        background: 'rgba(0,0,0,0.7)',
        borderBottom: '2px solid #fff',
        color: '#fff',
        position: 'fixed', // Make navbar fixed
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1000,
        boxSizing: 'border-box'
    };

    const navLogoStyle: React.CSSProperties = {
         fontFamily: "'Press Start 2P', cursive", // Make sure font is loaded globally or import here
         fontSize: '1rem',
         color: '#fff',
         textDecoration: 'none'
    };

     const navRightStyle: React.CSSProperties = {
         display: 'flex',
         alignItems: 'center',
         gap: '1rem'
     };

     const profileDropdownStyle: React.CSSProperties = {
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer'
     };

     const profilePicStyle: React.CSSProperties = {
         width: '32px',
         height: '32px',
         borderRadius: '50%',
         marginRight: '0.5rem',
         border: '1px solid #fff' 
     };

     const dropdownMenuStyle: React.CSSProperties = {
         position: 'absolute',
         top: '100%',
         right: 0,
         marginTop: '5px',
         background: 'rgba(0,0,0,0.9)',
         border: '1px solid #fff',
         borderRadius: '6px',
         overflow: 'hidden',
         zIndex: 1001,
         display: dropdownOpen ? 'block' : 'none', // Control visibility
         minWidth: '120px'
     };

      const dropdownLinkStyle: React.CSSProperties = {
          display: 'block',
          padding: '0.5rem 1rem',
          color: '#fff',
          textDecoration: 'none',
          fontSize: '0.85rem',
          whiteSpace: 'nowrap'
     };


    return (
        <header style={navbarStyle}>
            <Link to="/home" style={navLogoStyle}>🎨 ColorGrid</Link>
            <div style={navRightStyle}>
                <span className="coins" style={{ fontSize: '0.9rem' }}>💰 {user?.coins ?? 0}</span>
                <div
                    style={profileDropdownStyle}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    ref={dropdownRef}
                >
                    <img
                        src={user?.profile_picture_url || defaultProfilePic}
                        alt={user?.username}
                        style={profilePicStyle}
                        onError={(e) => (e.currentTarget.src = defaultProfilePic)} // Fallback if URL fails
                    />
                    <span className="username" style={{ fontSize: '0.9rem' }}>{user?.username}</span>
                    <div style={dropdownMenuStyle}>
                        <Link
                            to="/update-profile"
                            style={dropdownLinkStyle}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            Update Profile
                        </Link>
                        <a
                            href="#" 
                            style={dropdownLinkStyle}
                            onClick={(e) => { e.preventDefault(); handleLogout(); }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            Logout
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;