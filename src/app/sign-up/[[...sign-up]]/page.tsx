import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
export default function SignUpPage() {
  return <main style={{ minHeight: "100dvh", display: "grid", placeContent: "center", padding: 20 }}><SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/" /><Link href="/" style={{ textAlign: "center", marginTop: 20 }}>Back to Shamba AI</Link></main>;
}
