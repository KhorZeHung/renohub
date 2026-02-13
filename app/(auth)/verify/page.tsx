"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function VerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
          <Mail className="h-6 w-6 text-green-600" />
        </div>
        <CardTitle className="text-xl">Check your email</CardTitle>
        <CardDescription>
          We&apos;ve sent a magic link to{" "}
          {email ? (
            <span className="font-medium text-foreground">{email}</span>
          ) : (
            "your email address"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>Click the link in the email to sign in to your account.</p>
          <p className="mt-2">The link will expire in 15 minutes.</p>
        </div>
        <div className="pt-2 text-sm text-muted-foreground">
          <p>Didn&apos;t receive the email?</p>
          <ul className="mt-2 space-y-1">
            <li>Check your spam folder</li>
            <li>Make sure you entered the correct email</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/login">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to login
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Loading...</CardTitle>
          </CardHeader>
        </Card>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
