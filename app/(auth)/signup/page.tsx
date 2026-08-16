import { Metadata } from "next";
import RegisterForm from "./RegisterForm";
import { pageMetadata } from "@/config/metadata";

export const metadata: Metadata = pageMetadata.signup;

export default function Register() {
  return <RegisterForm />;
}
