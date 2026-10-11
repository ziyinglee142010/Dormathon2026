
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../api';
import { REFRESH_TOKEN, ACCESS_TOKEN } from '../constants';
import { use, useEffect, useState } from 'react';


function ProtectedRoute({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    useEffect(() => {
        auth().catch(() => {
            setIsAuthenticated(false);
        });
    }, []);


    const refreshToken = async () => {
        try {
            const response = await api.post('/api/token/refresh/', {
                refresh: localStorage.getItem(REFRESH_TOKEN),
            });
            if (response.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, response.data.access);
                setIsAuthenticated(true);
            } else{
                setIsAuthenticated(false);
            }
            
        } catch (error) {
            console.error('Refresh token failed:', error);
            setIsAuthenticated(false);
        }
    }

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthenticated(false);
            return;
        }

        const decoded = jwtDecode(token);
        // Get the expiration time from the decoded token
        const tokenExpiration = decoded.exp;
        // Convert expiration time to seconds
        const now = Date.now() / 1000;
        
        if (tokenExpiration < now) {
            await refreshToken();
        } else {
            setIsAuthenticated(true);
        }
    }

    if (isAuthenticated === null) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Loading...</p>
            </div>
        )
    }

    return isAuthenticated ? children : <Navigate to="/login" />;

}


export default ProtectedRoute;
