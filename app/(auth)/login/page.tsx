import { Metadata } from "next";
import LoginForm from "./LoginForm";
import { pageMetadata } from "@/config/metadata";

export const metadata: Metadata = pageMetadata.login;

export default function Register() {
  return <LoginForm />;
}
