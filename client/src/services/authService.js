import api from './api';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const authService = {
  // Login with email and password
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.data) {
        const { token, user } = response.data.data;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return { user, token };
      }
      throw new Error(response.data?.message || 'Login failed');
    } catch (error) {
      // In offline / fallback mode: support local demo user if backend is down
      const savedUsersStr = localStorage.getItem('local_registered_users');
      const registeredUsers = savedUsersStr ? JSON.parse(savedUsersStr) : [];
      
      const foundUser = registeredUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (foundUser) {
        const dummyToken = 'local_jwt_' + Date.now();
        const safeUser = { ...foundUser };
        delete safeUser.password;
        localStorage.setItem(TOKEN_KEY, dummyToken);
        localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
        return { user: safeUser, token: dummyToken };
      }

      if (
        (email.toLowerCase() === 'student@noticeassistant.edu' || email.toLowerCase() === 'student@pathpilot.edu') &&
        password === 'password123'
      ) {
        const dummyToken = 'local_jwt_demo_' + Date.now();
        const demoUser = {
          _id: 'usr_demo_student_01',
          name: 'Aarav Sharma',
          email: 'student@noticeassistant.edu',
          role: 'student',
          organization: 'National Institute of Technology'
        };
        localStorage.setItem(TOKEN_KEY, dummyToken);
        localStorage.setItem(USER_KEY, JSON.stringify(demoUser));
        return { user: demoUser, token: dummyToken };
      }

      const errMsg = error.response?.data?.message || error.message || 'Invalid email or password.';
      throw new Error(errMsg);
    }
  },

  // Register new user
  signup: async ({ name, email, password, role = 'student', organization = '' }) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        organization
      });

      if (response.data && response.data.data) {
        const { token, user } = response.data.data;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return { user, token };
      }
      throw new Error(response.data?.message || 'Signup failed');
    } catch (error) {
      // Local fallback for offline/demo operation
      const savedUsersStr = localStorage.getItem('local_registered_users');
      const registeredUsers = savedUsersStr ? JSON.parse(savedUsersStr) : [];

      if (registeredUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('An account with this email already exists.');
      }

      const newUser = {
        _id: 'usr_' + Date.now().toString(36),
        name,
        email,
        password, // For local fallback lookup
        role,
        organization: organization || 'Academic Institution'
      };

      registeredUsers.push(newUser);
      localStorage.setItem('local_registered_users', JSON.stringify(registeredUsers));

      const dummyToken = 'local_jwt_' + Date.now();
      const safeUser = { ...newUser };
      delete safeUser.password;
      localStorage.setItem(TOKEN_KEY, dummyToken);
      localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
      return { user: safeUser, token: dummyToken };
    }
  },

  // Instant 1-click Demo Login
  demoLogin: async () => {
    try {
      const res = await api.post('/auth/demo');
      if (res.data && res.data.data) {
        const { token, user } = res.data.data;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return { user, token };
      }
    } catch (e) {
      console.warn('Backend demo auth endpoint fallback to local demo:', e.message);
    }

    const demoUser = {
      _id: 'usr_demo_student_01',
      name: 'Aarav Sharma',
      email: 'student@noticeassistant.edu',
      role: 'student',
      preferredLanguage: 'English',
      organization: 'National Institute of Technology'
    };
    const dummyToken = 'jwt_demo_token_' + Date.now();
    localStorage.setItem(TOKEN_KEY, dummyToken);
    localStorage.setItem(USER_KEY, JSON.stringify(demoUser));
    return { user: demoUser, token: dummyToken };
  },

  // Logout
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Get current session
  getStoredUser: () => {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  getStoredToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  }
};

export default authService;
