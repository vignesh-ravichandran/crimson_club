/**
 * Auth layout: sign-in, sign-up. If already logged in, redirect to app home.
 * Per docs/lld/frontend-design.md §8.1 and task 04-frontend-auth-shell.
 */
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (user) redirect("/");
  return (
    <div className="min-h-screen bg-app flex flex-col items-center justify-center p-6">
      {children}
    </div>
  );
}
