import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
export default function SignInPage() {
  return <main style={{ minHeight: "100dvh", display: "grid", placeContent: "center", padding: 20 }}><SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/" /><Link href="/" style={{ textAlign: "center", marginTop: 20 }}>Back to Shamba AI</Link></main>;
}
