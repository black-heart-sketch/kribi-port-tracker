import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  name: string;
}

export const FormInput = ({
  label,
  error,
  className,
  id,
  name,
  ...props
}: FormInputProps) => (
  <div className="space-y-2">
    <Label htmlFor={id || name} className={cn(error && "text-destructive")}>
      {label}
    </Label>
    <Input
      id={id || name}
      name={name}
      className={cn("w-full", error && "border-destructive", className)}
      {...props}
    />
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
);
