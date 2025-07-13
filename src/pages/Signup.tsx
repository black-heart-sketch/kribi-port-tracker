import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/auth/FormInput";
import { Checkbox } from "@/components/ui/checkbox";
import { signupSchema } from "@/lib/validations/auth";
import { useToast } from "@/components/ui/use-toast";
import { useAuth, type SignupFormData } from "@/contexts/AuthContext";
import { Anchor } from "lucide-react";

const Signup = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signup } = useAuth();

  type FormValues = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    terms: boolean;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onSubmit = async (formData: FormValues) => {
    try {
      const signupData: SignupFormData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        terms: formData.terms,
      };
      
      await signup(signupData);
      toast({
        title: "Account created successfully",
        description: "Please check your email to verify your account.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Signup failed",
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
          <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
          <p className="mt-2 text-muted-foreground">
            Enter your details to get started
          </p>
        </div>

        <div className="bg-card p-8 rounded-xl shadow-sm border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormInput
                  name="name"
                  label="Full Name"
                  placeholder="John Doe"
                  error={form.formState.errors.name?.message}
                />
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
                <FormInput
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  error={form.formState.errors.confirmPassword?.message}
                />
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      {...form.register("terms")}
                      className="mt-1"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I agree to the{" "}
                        <a
                          href="#"
                          className="text-primary hover:underline"
                          onClick={(e) => e.preventDefault()}
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="#"
                          className="text-primary hover:underline"
                          onClick={(e) => e.preventDefault()}
                        >
                          Privacy Policy
                        </a>
                      </label>
                      {form.formState.errors.terms?.message && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.terms.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Create Account
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
