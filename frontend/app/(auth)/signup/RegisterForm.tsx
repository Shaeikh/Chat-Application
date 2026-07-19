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
import { signUpSchema } from "@/lib/validations/auth";
import { Link } from "next-view-transitions";

const RegisterForm = () => {
  const router = useRouter();

  const [name, setUsername] = useState<string>("Shaeikh");
  const [email, setEmail] = useState<string>("sheikha24608@gmail.com");
  const [password, setPassword] = useState<string>("SpecialPass123$$");
  const [confirmPassword, setConfirmPassword] =
    useState<string>("SpecialPass123$$");
  const image =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2NLEHl5XGc3uuRqpAwuNjYljXHejw64ayZeG5CgnSbxsNVPBfRbpv-zk&s=10";

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [serverError, setServerError] = useState<string>("");

  const handleSubmitForm = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setFormErrors({});

    const validation = signUpSchema.safeParse({
      email,
      password,
      name,
      confirmPassword,
    });

    if (!validation.success) {
      const errors = validation?.error?.flatten()?.fieldErrors;
      setFormErrors(errors as Record<string, string[]>);
      console.log(formErrors);
      return;
    }

    const { data, error } = await authClient.signUp.email(
      {
        email,
        password,
        name,
        image,
        callbackURL: "/login",
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
          setServerError("An error occured! Please try again later.");
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
                  Signup to Konvo
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground font-normal">
                  Signup to your account now
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
                    <span className="px-4">or continue with</span>
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
                        disabled={isLoading}
                        id="text"
                        type="text"
                        placeholder="Enter your name"
                        required
                        className="dark:bg-background shadow-xs text-md! px-4! h-10 rounded-lg"
                        value={name}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                      {formErrors.name && (
                        <FieldDescription className="text-red-400">
                          {formErrors.name[0]}
                        </FieldDescription>
                      )}
                    </Field>
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
                    <Field className="gap-1.5">
                      <FieldLabel
                        htmlFor="confirmPassword"
                        className="text-sm text-muted-foreground font-normal"
                      >
                        Confirm Password*
                      </FieldLabel>

                      <Input
                        disabled={isLoading}
                        id="confirm-password"
                        type="password"
                        placeholder="Enter your password again"
                        required
                        className="dark:bg-background shadow-xs text-md! px-4! h-10 rounded-lg"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      {formErrors.confirmPassword && (
                        <FieldDescription className="text-red-400">
                          {formErrors.confirmPassword[0]}
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
                      Sign up
                    </Button>
                    <FieldDescription>
                      By signing up, you acknowledge that you understand and
                      agree to the <a>Terms & Conditions</a> and{" "}
                      <a>Privacy Policy</a>
                    </FieldDescription>{" "}
                    {serverError && (
                      <FieldDescription className="text-red-400">
                        {serverError}
                      </FieldDescription>
                    )}
                    <FieldDescription className="text-center text-sm font-normal text-muted-foreground">
                      Already have an account?{" "}
                      <Link
                        href="login"
                        className="font-medium text-card-foreground no-underline!"
                      >
                        Log in
                      </Link>
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
