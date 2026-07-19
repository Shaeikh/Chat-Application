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
import { useRouter } from "next/navigation";
import { loginSchema } from "@/lib/validations/auth";

const LoginForm = () => {
  const router = useRouter();

  const [email, setEmail] = useState<string>("sheikha24608@gmail.com");
  const [password, setPassword] = useState<string>("SpecialPass123$$");
  const [rememberMe, setRememberMe] = useState<boolean>(true); // TODO: Create a remmeber me checkbox

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [serverError, setServerError] = useState<string>("");

  const handleSubmitForm = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setFormErrors({});

    const validation = loginSchema.safeParse({
      email,
      password,
    });

    if (!validation.success) {
      const errors = validation?.error?.flatten()?.fieldErrors;
      setFormErrors(errors as Record<string, string[]>);
      return;
    }

    const { data, error } = await authClient.signIn.email(
      {
        email,
        password,
        rememberMe,
        callbackURL: "/chat",
      },
      {
        onRequest: (ctx) => {
          if (serverError) setServerError("");
          setIsLoading(true);
        },
        onSuccess: (ctx) => {
          router.push(`${JSON.parse(ctx.request.body).callbackURL}`);
        },
        onError: (ctx) => {
          setIsLoading(false);
          setServerError(ctx.error.message);
        },
      },
    );
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
          fill
          priority
          sizes="100vw"
          className="object-fill object-center opacity-40"
        />
      </div>
      <div className="py-10 md:py-20 max-w-7xl max-[1400px]:max-w-xl px-4 sm:px-0 m-auto w-full z-10">
        <div className="w-full max-w-xl">
          <Card className="mr-10 p-6 sm:p-10 relative">
            <CardHeader className="text-center gap-6 p-0">
              {/* <div className="mx-auto">
                <a href="">
                  <img
                    src="https://images.shadcnspace.com/assets/logo/logo-icon-white.svg"
                    alt="shadcnspace"
                    className="hidden dark:block h-10 w-10"
                  />
                </a>
              </div> */}
              <div className="flex flex-col gap-1">
                <CardTitle className="text-2xl font-medium text-card-foreground">
                  Log in to Konvo
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground font-normal">
                  Log in to your account now
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex items-center">
              <form className="flex-1" onSubmit={handleSubmitForm}>
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
                      Log in with Google
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
                      Log in with Github
                    </Button>
                  </Field>
                  <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card text-sm text-muted-foreground bg-transparent">
                    <span className="px-4">or continue with</span>
                  </FieldSeparator>

                  <div className="flex flex-col gap-4">
                    <Field className="gap-1.5">
                      <FieldLabel
                        htmlFor="email"
                        className="text-sm text-muted-foreground font-normal"
                      >
                        Email*
                      </FieldLabel>
                      <Input
                        disabled={isLoading}
                        id="email"
                        type="email"
                        placeholder="example@company.com"
                        required
                        className="dark:bg-background shadow-xs text-md! px-4! h-10 rounded-lg"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      {formErrors.email && (
                        <FieldDescription className="text-red-400">
                          {formErrors.email[0]}
                        </FieldDescription>
                      )}
                    </Field>
                    <Field className="gap-1.5">
                      <FieldLabel
                        htmlFor="password"
                        className="text-sm text-muted-foreground font-normal"
                      >
                        Password*
                      </FieldLabel>

                      <Input
                        disabled={isLoading}
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        required
                        className="dark:bg-background shadow-xs text-md! px-4! h-10 rounded-lg"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      {formErrors.password && (
                        <FieldDescription className="text-red-400">
                          {formErrors.password[0]}
                        </FieldDescription>
                      )}
                    </Field>
                  </div>

                  <Field className="gap-4">
                    <Button
                      disabled={isLoading}
                      type="submit"
                      size={"lg"}
                      className="bg-primary/80 rounded-lg cursor-pointer h-12 text-md! hover:bg-primary/60"
                    >
                      Log in
                    </Button>
                    {serverError && (
                      <FieldDescription className="text-red-400">
                        {serverError}
                      </FieldDescription>
                    )}
                    <FieldDescription className="text-center text-sm font-normal text-muted-foreground">
                      New User?{" "}
                      <a
                        href="signup"
                        className="font-medium text-card-foreground no-underline!"
                      >
                        Sign Up
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

export default LoginForm;
