import { InlineSignUp } from "@/components/auth/auth-actions";

export const metadata = {
  title: "Request access",
};

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <InlineSignUp />
    </main>
  );
}
