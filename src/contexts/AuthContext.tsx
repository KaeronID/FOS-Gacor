import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { getCurrentUser, setCurrentUser, getUsers, saveUsers } from '@/utils/storage';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: 'buyer' | 'seller' | 'admin') => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const validateEmail = (email: string, role: 'buyer' | 'seller' | 'admin'): boolean => {
    if (role === 'buyer' && !email.endsWith('@student.unika.ac.id')) {
      toast({
        title: 'Invalid Email',
        description: 'Buyers must use @student.unika.ac.id email',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const users = getUsers();
      const foundUser = users.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        toast({
          title: 'Login Failed',
          description: 'Invalid email or password',
          variant: 'destructive',
        });
        return false;
      }

      // Email validation is only enforced during registration

      setUser(foundUser);
      setCurrentUser(foundUser);
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${foundUser.name}!`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: 'Login Error',
        description: 'An error occurred during login',
        variant: 'destructive',
      });
      return false;
    }
  };

  const register = async (email: string, password: string, name: string, role: 'buyer' | 'seller' | 'admin'): Promise<boolean> => {
    try {
      const users = getUsers();
      
      if (users.find(u => u.email === email)) {
        toast({
          title: 'Registration Failed',
          description: 'Email already exists',
          variant: 'destructive',
        });
        return false;
      }

      if (!validateEmail(email, role)) {
        return false;
      }

      const newUser: User = {
        id: Date.now().toString(),
        email,
        password,
        role,
        name,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      saveUsers(users);

      toast({
        title: 'Registration Successful',
        description: 'Account created successfully. Please login.',
      });

      return true;
    } catch (error) {
      toast({
        title: 'Registration Error',
        description: 'An error occurred during registration',
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentUser(null);
    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully',
    });
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    setCurrentUser(updatedUser);
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};