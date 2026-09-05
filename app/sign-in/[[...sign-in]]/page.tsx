import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <SignIn path="/sign-in" routing="path" fallbackRedirectUrl="/admin" />
    </div>
  );
}
