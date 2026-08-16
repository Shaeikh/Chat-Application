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
import { Link } from "next-view-transitions";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";

const LoginForm = () => {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [serverError, setServerError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

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
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-foreground px-4 py-8 dark:bg-background sm:px-6 lg:px-8">
      {/* Background image */}
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-25"
        />

        {/* Background overlays */}
        <div className="absolute inset-0 bg-linear-to-br from-background/90 via-background/60 to-primary/10" />

        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center">
        {/* Logo / brand */}
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <span className="text-lg font-bold">[K]</span>
          </div>

          <span className="text-lg font-semibold tracking-tight text-background dark:text-foreground">
            Konvo
          </span>
        </div>

        <Card className="w-full overflow-hidden rounded-2xl border-border/60 bg-card/95 shadow-2xl shadow-black/10 backdrop-blur-xl">
          <CardHeader className="space-y-2 px-6 pt-7 text-center sm:px-8 sm:pt-8">
            <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome back
            </CardTitle>

            <CardDescription className="text-sm leading-relaxed text-muted-foreground">
              Log in to your Konvo account to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-7 sm:px-8 sm:pb-8">
            <form className="w-full" onSubmit={handleSubmitForm}>
              <FieldGroup className="gap-5">
                {/* Social login */}
                <Field className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    type="button"
                    className="h-11 rounded-xl border-border/70 text-sm font-medium shadow-sm transition-colors text-medium text-card-foreground gap-2 hover:cursor-not-allowed"
                  >
                    <img
                      src="https://images.shadcnspace.com/assets/svgs/icon-google.svg"
                      alt="Google"
                      className="h-4 w-4"
                    />
                    Google
                  </Button>

                  <Button
                    variant="outline"
                    type="button"
                    className="h-11 rounded-xl border-border/70 text-sm font-medium shadow-sm transition-colors text-medium text-card-foreground gap-2 hover:cursor-not-allowed"
                  >
                    <img
                      src="https://images.shadcnspace.com/assets/svgs/icon-github.svg"
                      alt="GitHub"
                      className="h-4 w-4 dark:hidden"
                    />
                    <img
                      src="https://images.shadcnspace.com/assets/svgs/icon-github-white.svg"
                      alt="GitHub"
                      className="hidden h-4 w-4 dark:block"
                    />
                    GitHub
                  </Button>
                </Field>

                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card text-sm text-muted-foreground bg-transparent">
                  {" "}
                  <span className="px-4">or continue with</span>{" "}
                </FieldSeparator>

                {/* Email */}
                <Field className="gap-2">
                  <FieldLabel
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                  >
                    Email address
                  </FieldLabel>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      disabled={isLoading}
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      className="h-11 rounded-xl border-border/70 bg-background pl-10 pr-4 shadow-sm transition-all placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {formErrors.email && (
                    <FieldDescription className="text-xs font-medium text-destructive">
                      {formErrors.email[0]}
                    </FieldDescription>
                  )}
                </Field>

                {/* Password */}
                <Field className="gap-2">
                  <div className="flex items-center justify-between">
                    <FieldLabel
                      htmlFor="password"
                      className="text-sm font-medium text-foreground"
                    >
                      Password
                    </FieldLabel>

                    {/* Keep this available for when you add forgot-password */}
                    <button
                      type="button"
                      disabled
                      className="text-xs font-medium text-primary opacity-50"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      disabled={isLoading}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                      className="h-11 rounded-xl border-border/70 bg-background pl-10 pr-11 shadow-sm transition-all placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {formErrors.password && (
                    <FieldDescription className="text-xs font-medium text-destructive">
                      {formErrors.password[0]}
                    </FieldDescription>
                  )}
                </Field>

                {/* Remember me */}
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />

                  <span>Remember me</span>
                </label>

                {/* Submit */}
                <Field className="gap-4">
                  <Button
                    disabled={isLoading}
                    type="submit"
                    size="lg"
                    className="h-12 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Log in"
                    )}
                  </Button>

                  {serverError && (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-center">
                      <FieldDescription className="text-xs font-medium text-destructive">
                        {serverError}
                      </FieldDescription>
                    </div>
                  )}

                  <FieldDescription className="text-center text-sm text-muted-foreground">
                    New to Konvo?{" "}
                    <Link
                      href="/signup"
                      className="font-semibold text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                    >
                      Create an account
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 px-4 text-center text-xs text-background/50 dark:text-foreground/40">
          By continuing, you agree to Konvo&apos;s terms and privacy policy.
        </p>
      </div>
    </section>
  );
};

export default LoginForm;
