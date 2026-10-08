import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/AuthShell";
export default function SignInPage() {
  return <AuthShell title="Welcome back to your garden."><SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/" /></AuthShell>;
}
