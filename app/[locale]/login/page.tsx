"use client";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import AuthBackgroundShape from "@/assets/svg/auth-background-shape";
import Logo from "@/assets/svg/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoginForm from "@/components/login/login-form";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/navbar/LanguageSwitcher";
import { GoogleIcon } from "@/components/icons/GoogleIcon";

export default function LoginPage() {
  const t = useTranslations("login");

  const handleSubmit = async (data: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe.toString(),
      redirect: false,
    });
    if (result?.error) {
      toast.error(`Wystąpił błąd podczas logowania!`, {
        position: "top-center",
        description: result.error,
      });
    } else {
      window.location.href = "/profile";
    }
  };

  const handleGoogleSignIn = () =>
    signIn("google", { callbackUrl: "/profile" });

  return (
    <div className="relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute">
        <AuthBackgroundShape />
      </div>

      <Card className="z-1 w-full border-none shadow-md sm:max-w-lg">
        <CardHeader className="gap-6">
          <div className="flex flex-row justify-between items-center">
            <Logo />
            <LanguageSwitcher className="w-auto" />
          </div>

          <div>
            <CardTitle className="mb-1.5 text-2xl">{t("title")}</CardTitle>
            <CardDescription className="text-base">
              {t("subtitle")}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <LoginForm onSubmit={handleSubmit} />

            <p className="text-muted-foreground text-center">
              {t.rich("dontHaveAccount", {
                signUpLink: (chunks) => (
                  <Link
                    href="/register"
                    className="text-card-foreground hover:underline"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </p>

            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <p>{t("or")}</p>
              <Separator className="flex-1" />
            </div>

            <Button
              variant="outline"
              className="cursor-pointer w-full gap-2 bg-background hover:bg-accent text-foreground font-medium border-input"
              onClick={handleGoogleSignIn}
            >
              <GoogleIcon className="h-5 w-5" />
              {t("google")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
