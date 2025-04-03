import React, { createContext, useContext, useState, useEffect } from 'react';
import { type CurrentUser } from '@shared/session';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from './queryClient';

// Export the interface for use in other components
export interface AuthContextType {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (profileData: {
    displayName?: string;
    bio?: string;
    avatarUri?: string;
  }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest<{ user: CurrentUser }>('/api/auth/me', {
          method: 'GET'
        });
        
        if (response && response.user) {
          setUser(response.user);
        }
      } catch (error) {
        // Not authenticated, that's okay
        console.log('User not authenticated');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiRequest<{ message: string; user: CurrentUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response && response.user) {
        setUser(response.user);
        toast({
          title: 'Login Successful',
          description: response.message || 'Welcome back!'
        });
        return true;
      }
      return false;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast({
        title: 'Login Failed',
        description: message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiRequest<{ message: string; user: CurrentUser }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response && response.user) {
        setUser(response.user);
        toast({
          title: 'Registration Successful',
          description: response.message || 'Your account has been created!'
        });
        return true;
      }
      return false;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast({
        title: 'Registration Failed',
        description: message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiRequest<{ message: string }>('/api/auth/logout', {
        method: 'POST'
      });

      setUser(null);
      
      if (response && response.message) {
        toast({
          title: 'Logged Out',
          description: response.message
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      toast({
        title: 'Logout Failed',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: {
    displayName?: string;
    bio?: string;
    avatarUri?: string;
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiRequest<{ message: string; user: CurrentUser }>('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response && response.user) {
        setUser(response.user);
        toast({
          title: 'Profile Updated',
          description: response.message || 'Your profile has been updated successfully!'
        });
        return true;
      }
      return false;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Profile update failed';
      toast({
        title: 'Update Failed',
        description: message,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}