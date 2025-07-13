import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/auth/FormInput";
import { useToast } from "@/components/ui/use-toast";
import { Anchor } from "lucide-react";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      // In a real app, this would send a password reset email
      console.log("Password reset requested for:", data.email);
      
      // Show success message
      toast({
        title: "Password reset email sent",
        description: "Please check your email for instructions to reset your password.",
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send password reset email",
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
          <h1 className="text-3xl font-bold tracking-tight">Forgot Password</h1>
          <p className="mt-2 text-muted-foreground">
            Enter your email and we'll send you a link to reset your password
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
              </div>

              <Button type="submit" className="w-full" size="lg">
                Send Reset Link
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

export default ForgotPassword;
