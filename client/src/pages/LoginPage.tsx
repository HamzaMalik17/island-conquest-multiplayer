import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import "../styles/login.css";

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login: contextLogin } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const userData = await authService.login(username, password);
            contextLogin(userData);
            navigate('/home');
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check username/password.');
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <div className="background-crowns">
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
            </div>
            <main className="auth-container">
                <h1 className="auth-title">Login</h1>
                {error && <p style={{ color: '#ff416c', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</p>}
                <form className="auth-form" onSubmit={handleSubmit}>
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={loading}
                    />

                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>
                <p className="auth-footer">
                    Don’t have an account? <Link to="/signup">Sign Up</Link>
                </p>
            </main>
        </div>
    );
};

export default LoginPage;