"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

const RegisterForm = () => {
  const [name, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const image =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2NLEHl5XGc3uuRqpAwuNjYljXHejw64ayZeG5CgnSbxsNVPBfRbpv-zk&s=10";

  const handldeSignUp = async () => {
    const { data, error } = await authClient.signUp.email(
      {
        email, // user email address
        password, // user password -> min 8 characters by default
        name, // user display name
        image, // User image URL (optional)
        callbackURL: "/", // A URL to redirect to after the user verifies their email (optional)
      },
      {
        onRequest: (ctx) => {
          //show loading
        },
        onSuccess: (ctx) => {
          //redirect to the dashboard or sign in page
        },
        onError: (ctx) => {
          // display the error message
          alert(ctx.error.message);
        },
      },
    );
    console.log(data);
  };

  return (
    <section className="bg-foreground dark:bg-background min-h-screen relative flex items-center justify-center">
      {/* <div className="pointer-events-none absolute inset-0 right-0 overflow-hidden md:block hidden"> */}
      {/* <div className="absolute left-1/1 top-0 h-650 w-650 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10" />
        <div className="absolute left-1/1 top-0 h-175 w-175 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground dark:bg-background" /> */}

      {/* </div> */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <Image
          src="/bg.png"
          alt="Background"
          fill // Makes the image fill the entire absolute container
          priority // Ensures fast loading since this spans the whole screen
          sizes="100vw" // Helps Next.js optimize file size for the screen width
          className="object-cover object-center opacity-40" // Replaces your 'cover' class with proper scaling
        />
      </div>
      <div className="py-10 md:py-20 max-w-7xl max-[1400px]:max-w-xl px-4 sm:px-0 m-auto w-full z-10">
        <div className="w-full max-w-xl">
          <Card className="mr-10 p-6 sm:p-12 relative">
            <CardHeader className="text-center gap-6 p-0">
              <div className="mx-auto">
                <a href="">
                  <img
                    src="https://images.shadcnspace.com/assets/logo/logo-icon-black.svg"
                    alt="shadcnspace"
                    className="dark:hidden h-10 w-10"
                  />
                  <img
                    src="https://images.shadcnspace.com/assets/logo/logo-icon-white.svg"
                    alt="shadcnspace"
                    className="hidden dark:block h-10 w-10"
                  />
                </a>
              </div>
              <div className="flex flex-col gap-1">
                <CardTitle className="text-2xl font-medium text-card-foreground">
                  Signup to Konvo
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground font-normal">
                  Signup to your account now
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex items-center">
              <form className="flex-1">
                <FieldGroup className="gap-6">
                  <Field className="grid md:grid-cols-2 md:gap-6 gap-3">
                    <Button
                      disabled
                      variant="outline"
                      type="button"
                      className="!disabled:cursor-not-allowed text-sm text-medium text-card-foreground gap-2 dark:bg-background rounded-lg h-9 shadow-xs"
                    >
                      <img
                        src="https://images.shadcnspace.com/assets/svgs/icon-google.svg"
                        alt="google icon"
                        className="h-4 w-4"
                      />
                      Sign up with Google
                    </Button>
                    <Button
                      disabled
                      variant="outline"
                      type="button"
                      className="disabled:cursor-not-allowed text-sm text-medium text-card-foreground gap-2 cursor-pointer dark:bg-background rounded-lg h-9 shadow-xs"
                    >
                      <img
                        src="https://images.shadcnspace.com/assets/svgs/icon-github.svg"
                        alt="github icon"
                        className="dark:hidden  h-4 w-4"
                      />
                      <img
                        src="https://images.shadcnspace.com/assets/svgs/icon-github-white.svg"
                        alt="github icon"
                        className="hidden dark:block  h-4 w-4"
                      />
                      Sign up with Github
                    </Button>
                  </Field>
                  <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card text-sm text-muted-foreground bg-transparent">
                    <span className="px-4">or sign up with</span>
                  </FieldSeparator>

                  <div className="flex flex-col gap-4">
                    <Field className="gap-1.5">
                      <FieldLabel
                        htmlFor="name"
                        className="text-sm text-muted-foreground font-normal"
                      >
                        Name*
                      </FieldLabel>
                      <Input
                        id="text"
                        type="text"
                        placeholder="Enter your name"
                        required
                        className="dark:bg-background shadow-xs text-md! px-4! h-10 rounded-lg"
                        value={name}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </Field>
                    <Field className="gap-1.5">
                      <FieldLabel
                        htmlFor="email"
                        className="text-sm text-muted-foreground font-normal"
                      >
                        Email*
                      </FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@company.com"
                        required
                        className="dark:bg-background shadow-xs text-md! px-4! h-10 rounded-lg"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </Field>
                    <Field className="gap-1.5">
                      <FieldLabel
                        htmlFor="password"
                        className="text-sm text-muted-foreground font-normal"
                      >
                        Password*
                      </FieldLabel>

                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        required
                        className="dark:bg-background shadow-xs text-md! px-4! h-10 rounded-lg"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </Field>
                  </div>

                  <Field className="gap-4">
                    <Button
                      type="submit"
                      size={"lg"}
                      className="bg-primary/80 rounded-lg cursor-pointer h-12 text-md! hover:bg-primary/60"
                      onClick={handldeSignUp}
                    >
                      Sign up
                    </Button>
                    <FieldDescription className="text-center text-sm font-normal text-muted-foreground">
                      Already have an account?{" "}
                      <a
                        href="login"
                        className="font-medium text-card-foreground no-underline!"
                      >
                        Sign in
                      </a>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
              {/* <div className="">
              <img
                src="https://images.shadcnspace.com/assets/svgs/icon-github.svg"
                alt="Illustration"
                className="w-80 h-auto"
              />
            </div> */}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default RegisterForm;
