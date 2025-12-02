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
import RegisterForm from "@/components/register/register-form";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/navbar/LanguageSwitcher";
import { GoogleIcon } from "@/components/icons/GoogleIcon";

export default function RegisterPage() {
  const t = useTranslations("register");

  const handleGoogleSignIn = () =>
    signIn("google", { callbackUrl: "/profile" });

  const handleSubmit = async (data: {
    username: string;
    email: string;
    password: string;
  }) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
      toast(`🎉 Zarejestrowany!`, {
        position: "top-center",
        description: `Zapnij pasy, trzymaj się i usiądź wygodnie. Zostaniesz przekierowany do logowania.`,
      });

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } else {
      toast.error(`Wystąpił błąd!`, {
        position: "top-center",
        description: result.error,
      });
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute">
        <AuthBackgroundShape />
      </div>

      <Card className="z-1 w-full border-none shadow-md sm:max-w-lg">
        <CardHeader className="gap-6">
          <div className="flex justify-between items-center">
            <Logo className="gap-3" />
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
            <RegisterForm onSubmit={handleSubmit} />

            <p className="text-muted-foreground text-center">
              {t.rich("alreadyHaveAccount", {
                signInLink: (chunks) => (
                  <Link
                    href="/login"
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
