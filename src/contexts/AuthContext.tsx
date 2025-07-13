import { createContext, useContext, ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginSchema, signupSchema } from "@/lib/validations/auth";

export type User = {
  id: string;
  name: string;
  email: string;
};

export type LoginFormData = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type SignupFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  signup: (data: SignupFormData) => Promise<void>;
  logout: () => void;
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In a real app, you would make an API call to your backend
      const mockUser = {
        id: "1",
        name: data.email.split("@")[0],
        email: data.email,
      };
      
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      
      if (data.rememberMe) {
        localStorage.setItem("rememberedEmail", data.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In a real app, you would make an API call to your backend
      const mockUser = {
        id: "1",
        name: data.name,
        email: data.email,
      };
      
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      
      navigate("/dashboard");
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
