import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Wavenet Care Dental Hospital Management System",
  description: "Create account for Wavenet Care Dental Hospital Management System",
};

export default function SignUp() {
  return <SignUpForm />;
}
