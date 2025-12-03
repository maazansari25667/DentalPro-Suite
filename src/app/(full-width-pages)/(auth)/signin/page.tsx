import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Wavenet Care Dental Hospital Management System",
  description: "Sign in to Wavenet Care Dental Hospital Management System",
};

export default function SignIn() {
  return <SignInForm />;
}
