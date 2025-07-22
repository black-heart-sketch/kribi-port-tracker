import { createContext, useContext, ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginSchema, signupSchema } from "@/lib/validations/auth";
import api from "@/config/axios.config";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  company?: string;
};

export type LoginFormData = {
  email: string;
  password: string;
  rememberMe?: boolean;
  name?:string;
};

export type SignupFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
  phone?: string;
  company?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  signup: (data: SignupFormData) => Promise<void>;
  logout: () => void;
  getUserId: () => string | null;
};



const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Check for stored user in localStorage on initial load
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      console.log('Login response:', response.data);
      
      if (response.data && response.data.success) {
        // Extract user data from the nested response.data.data
        const responseData = response.data.data || {};
        const token = response.data.token;
        
        const userData = {
          id: responseData._id || responseData.id || '1',
          name: responseData.name || data.name,
          email: responseData.email || data.email,
          role: responseData.role || 'viewer',
          // Include any other user data you need
          ...responseData
        };
        
        if (token) {
          localStorage.setItem('token', token);
        }
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        if (data.rememberMe) {
          localStorage.setItem('rememberedEmail', userData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        console.log('User after login:', userData);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const getUserId = () => {
    return user?.id;
  };

  const signup = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', data);
      console.log('Signup response:', response.data);
      
      if (response.data) {
        const userData = {
          id: response.data.id || '1',
          name: data.name,
          email: data.email,
          role: response.data.role || 'viewer', // Default to 'viewer' if role not provided
        };
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('User after signup:', userData);
      navigate('/dashboard');
      }
    } catch (error) {
      console.error("Signup failed:", error);
      throw new Error("Failed to create an account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        getUserId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
