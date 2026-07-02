import { InlineSignIn } from "@/components/auth/auth-actions";

export const metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <InlineSignIn />
    </main>
  );
}
