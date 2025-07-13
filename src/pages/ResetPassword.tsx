import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/auth/FormInput";
import { useToast } from "@/components/ui/use-toast";
import { Anchor } from "lucide-react";
import { z } from "zod";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      if (!token) {
        throw new Error("Invalid or expired reset token");
      }
      
      // In a real app, this would verify the token and update the password
      console.log("Resetting password with token:", token);
      console.log("New password:", data.password);
      
      // Show success message
      toast({
        title: "Password reset successful",
        description: "Your password has been updated successfully.",
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset password",
      });
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-card p-8 rounded-xl shadow-sm border">
            <h2 className="text-2xl font-bold mb-4">Invalid Token</h2>
            <p className="text-muted-foreground mb-6">
              The password reset link is invalid or has expired. Please request a new one.
            </p>
            <Button asChild>
              <Link to="/forgot-password">Request New Reset Link</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-wave rounded-2xl">
              <Anchor className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Reset Password</h1>
          <p className="mt-2 text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        <div className="bg-card p-8 rounded-xl shadow-sm border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormInput
                  name="password"
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  error={form.formState.errors.password?.message}
                />
                <FormInput
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  error={form.formState.errors.confirmPassword?.message}
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Reset Password
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            Remember your password?{" "}
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

export default ResetPassword;
