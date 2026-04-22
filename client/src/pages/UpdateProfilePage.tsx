// client/src/pages/UpdateProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import userService from '../services/userService'; 
import "../styles/update_profile.css"; 

interface AuthenticatedUser {
    _id?: string;
    userId?: string;
    username: string;
    coins?: number; 
    profile_picture_url?: string;
}

const UpdateProfilePage: React.FC = () => {
    const { user, updateUserProfileContext, loading: authLoading } = useAuth() as {
        user: AuthenticatedUser | null;
        updateUserProfileContext: (data: Partial<AuthenticatedUser>) => void;
        loading: boolean;
    };
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState(''); 
    const [profilePic, setProfilePic] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false); 

     useEffect(() => {
        if (!authLoading && user) {
            setUsername(user.username);
            setProfilePic(user.profile_picture_url || '');
        }
     }, [user, authLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (authLoading) {
            setError("Still loading user data. Please wait.");
            return;
        }
        if (!user) {
            setError("Not logged in. Cannot update profile.");
            return;
        }

        const userIdToUpdate = user._id || user.userId; 

        if (!userIdToUpdate) {
            setError("Could not identify your user ID. Please log in again.");
            console.error("User object missing ID:", user);
            return;
        }

        if (!username.trim()) { 
            setError("Username cannot be empty.");
            return;
        }

        setLoading(true); 

        const updateData: Partial<{ username: string; password?: string; profile_picture_url: string }> = {
            username: username,
            profile_picture_url: profilePic,
        };
        if (password) {
            updateData.password = password;
        }

        console.log(`[UpdateProfile] Attempting update for userId: ${userIdToUpdate} with data:`, updateData);

        try {
            const updatedUserData = await userService.updateProfile(userIdToUpdate, updateData);

            updateUserProfileContext(updatedUserData);
            setSuccess("Profile updated successfully!");
            setPassword(''); 
             setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to update profile.');
            console.error("Update profile error response:", err.response || err); 
        } finally {
            setLoading(false); 
        }
    };

     if (authLoading) {
         return <main className="update-container"><p>Loading user data...</p></main>;
     }

     if (!user) {
         return <main className="update-container"><p>Please log in to update your profile.</p></main>;
     }

    return (
        <main className="update-container">
            <h1 className="update-title">Update Profile</h1>
            {error && <p style={{ color: '#ff416c', marginBottom: '1rem', fontWeight: 'bold' }}>{error}</p>}
            {success && <p style={{ color: '#4caf50', marginBottom: '1rem', fontWeight: 'bold' }}>{success}</p>}

            <form className="update-form" onSubmit={handleSubmit}>
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

                <label htmlFor="password">New Password (leave blank to keep current)</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    disabled={loading}
                />

                {/* <label htmlFor="profilePic">Profile Picture URL</label>
                <input
                    id="profilePic"
                    name="profilePic"
                    type="url"
                    value={profilePic}
                    onChange={(e) => setProfilePic(e.target.value)}
                    placeholder="http://example.com/image.png"
                    disabled={loading}
                /> */}

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </main>
    );
};

export default UpdateProfilePage;