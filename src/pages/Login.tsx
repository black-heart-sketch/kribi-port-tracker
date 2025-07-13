import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/auth/FormInput";
import { Checkbox } from "@/components/ui/checkbox";
import { loginSchema } from "@/lib/validations/auth";
import { useToast } from "@/components/ui/use-toast";
import { useAuth, type LoginFormData } from "@/contexts/AuthContext";
import { Anchor } from "lucide-react";

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Get the previous location or default to dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  type FormValues = {
    email: string;
    password: string;
    rememberMe: boolean;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (formData: FormValues) => {
    try {
      const loginData: LoginFormData = {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      };
      
      await login(loginData);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      navigate(from, { replace: true });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-wave rounded-2xl">
              <Anchor className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>

        <div className="bg-card p-8 rounded-xl shadow-sm border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormInput
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="name@example.com"
                  error={form.formState.errors.email?.message}
                />
                <FormInput
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  error={form.formState.errors.password?.message}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    {...form.register("rememberMe")}
                  />
                  <label
                    htmlFor="rememberMe"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Sign in
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
