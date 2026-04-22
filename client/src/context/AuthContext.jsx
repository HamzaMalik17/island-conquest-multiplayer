import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); 
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
         const storedUserInfo = localStorage.getItem('userInfo');
         if (storedUserInfo) {
            setUser(JSON.parse(storedUserInfo));
          }
         setLoading(false); 
    }, []);


    const login = (userData) => {
         setUser(userData);
        localStorage.setItem('userInfo', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
        authService.logout();
    };

    const updateUserCoins = (newCoinBalance) => {
         if (user) {
             const updatedUser = { ...user, coins: newCoinBalance };
             setUser(updatedUser);
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
         }
    };

     const updateUserProfileContext = (updatedProfileData) => {
         if (user) {
             const updatedUser = { ...user, ...updatedProfileData }; 
             setUser(updatedUser);
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
         }
     };


    return (
        <AuthContext.Provider value={{ user, login, logout, updateUserCoins, updateUserProfileContext, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);