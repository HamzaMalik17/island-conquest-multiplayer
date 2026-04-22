import React, { useState } from 'react'; 
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; 
import authService from '../services/authService';
import '../styles/signup.css'; 

const SignupPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [profilePic, setProfilePic] = useState('');

    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [generalError, setGeneralError] = useState(''); 

    const { login } = useAuth();
    const navigate = useNavigate();

    const validateForm = () => {
        let isValid = true;
        setUsernameError(''); 
        setPasswordError('');

        if (!username.trim()) {
            setUsernameError('Username is required.');
            isValid = false;
        }

        if (!password) {
            setPasswordError('Password is required.');
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters long.');
            isValid = false;
        }

        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError(''); 

        if (!validateForm()) {
            return; 
        }

        try {
            const userData = await authService.signup(username, password, profilePic);
            login(userData); 
            navigate('/home'); 
        } catch (err) {
            console.error("Signup failed:", err);
            setGeneralError(err.message || 'Signup failed. Please try again.');
        }
    };

    return (
        <main className="auth-container" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div> 
                <h1 className="auth-title">Sign Up</h1>
                <form className="auth-form" onSubmit={handleSubmit} noValidate> 
                    <div> 
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required 
                        />
                        {usernameError && <p style={{ color: 'red', fontSize: '0.8em', marginTop: '0.2em' }}>{usernameError}</p>}
                    </div>

                    <div>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            aria-describedby="password-error" 
                        />
                        {passwordError && <p id="password-error" style={{ color: 'red', fontSize: '0.8em', marginTop: '0.2em' }}>{passwordError}</p>}
                    </div>

                    {/* <div>
                        <label htmlFor="profilePic">Profile Picture URL (optional)</label>
                        <input
                            id="profilePic"
                            name="profilePic"
                            type="url"
                            value={profilePic}
                            onChange={(e) => setProfilePic(e.target.value)}
                        />
                    </div> */}

                    {generalError && <p style={{ color: 'red', marginTop: '1em' }}>{generalError}</p>}

                    <button type="submit" className="btn btn-primary">Create Account</button>
                </form>
                <p className="auth-footer">
                    Already have an account? <Link to="/login">Log In</Link>
                </p>
            </div>
        </main>
    );
};

export default SignupPage;