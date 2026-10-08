import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/AuthShell";
export default function SignUpPage() {
  return <AuthShell title="Keep your garden plan in one place."><SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/" /></AuthShell>;
}
