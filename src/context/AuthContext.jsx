import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_URL = 'http://localhost:5000/api';

export const ALL_SYSTEM_TABS = [
  { id: 'dashboard', label: "Today's Overview", category: 'Core' },
  { id: 'opd', label: 'OPD Registration', category: 'Clinical' },
  { id: 'ipd', label: 'IPD Admission & Wards', category: 'Clinical' },
  { id: 'panchkarma', label: 'Panchkarma Specialty', category: 'Clinical' },
  { id: 'lab', label: 'Laboratory & Pathology', category: 'Investigations' },
  { id: 'pharmacy', label: 'Pharmacy Dispensary', category: 'Medicine' },
  { id: 'billing', label: 'Financial Receipts', category: 'Finance' },
  { id: 'doctors', label: 'Doctor Roster', category: 'Staff' },
  { id: 'reports', label: 'Reports & Analytics', category: 'Management' },
  { id: 'masters', label: 'User & System Masters', category: 'Administration' },
];

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [jwtToken, setJwtToken] = useState(() => localStorage.getItem('hms_jwt_token') || null);
  const [currentUser, setCurrentUser] = useState(null);

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Security Lockout Countdown
  useEffect(() => {
    let timer;
    if (isLockedOut && lockoutTimer > 0) {
      timer = setInterval(() => {
        setLockoutTimer(prev => {
          if (prev <= 1) {
            setIsLockedOut(false);
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLockedOut, lockoutTimer]);

  // Load Active User & Users List from Backend Server
  useEffect(() => {
    const initSession = async () => {
      const savedToken = localStorage.getItem('hms_jwt_token');
      if (savedToken) {
        try {
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${savedToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            setCurrentUser(data.user);
            setJwtToken(savedToken);
          } else {
            // Token invalid or expired
            localStorage.removeItem('hms_jwt_token');
            setJwtToken(null);
            setCurrentUser(null);
          }
        } catch (e) {
          console.warn('Backend server unreachable, working in standalone mode', e);
        }
      }
    };
    initSession();
  }, []);

  // Fetch all users list when Admin is logged in
  const fetchUsers = async () => {
    if (!jwtToken) return;
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.warn('Unable to fetch users from backend server', e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser, jwtToken]);

  // LOGIN API Call (Bcrypt Server Verification + Signed JWT Return)
  const login = async (usernameInput, passwordInput) => {
    if (isLockedOut) {
      return { success: false, error: `Account locked for security. Please wait ${lockoutTimer} seconds.` };
    }

    const cleanUser = String(usernameInput || '').trim().toLowerCase();
    const cleanPass = String(passwordInput || '').trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, error: 'Please enter both username and password.' };
    }

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password: cleanPass })
      });

      const data = await res.json();

      if (!res.ok) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= 5) {
          setIsLockedOut(true);
          setLockoutTimer(30);
          return { success: false, error: '⚠️ Too many failed attempts! Security Lockout activated for 30 seconds.' };
        }

        return { success: false, error: data.error || `Invalid credentials. (${5 - newAttempts} attempts left)` };
      }

      // Successful Backend JWT Login!
      setFailedAttempts(0);
      setJwtToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem('hms_jwt_token', data.token);

      return { success: true, user: data.user, token: data.token };
    } catch (e) {
      console.error('Server login error', e);
      return { success: false, error: 'Cannot connect to backend auth server on http://localhost:5000' };
    }
  };

  const logout = () => {
    setJwtToken(null);
    setCurrentUser(null);
    try {
      localStorage.removeItem('hms_jwt_token');
    } catch (e) {}
  };

  // ADMIN ACTION: Create New User via Backend API
  const createUser = async (newUserObj) => {
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify(newUserObj)
      });
      if (res.ok) {
        await fetchUsers();
        return true;
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create user');
        return false;
      }
    } catch (e) {
      console.error('Error creating user', e);
      return false;
    }
  };

  // ADMIN ACTION: Update User Permissions / Password via Backend API
  const updateUser = async (userId, updatedFields) => {
    try {
      const res = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        await fetchUsers();
        // Refresh current user if self updated
        if (currentUser && currentUser.id === userId) {
          const meRes = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${jwtToken}` }
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            setCurrentUser(meData.user);
          }
        }
        return true;
      }
    } catch (e) {
      console.error('Error updating user', e);
    }
    return false;
  };

  // ADMIN ACTION: Delete User via Backend API
  const deleteUser = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      if (res.ok) {
        await fetchUsers();
        return true;
      }
    } catch (e) {
      console.error('Error deleting user', e);
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{
      users,
      jwtToken,
      currentUser,
      login,
      logout,
      createUser,
      updateUser,
      deleteUser,
      isLockedOut,
      lockoutTimer,
      failedAttempts
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
