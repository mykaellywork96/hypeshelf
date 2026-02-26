import { SignIn } from "@clerk/nextjs";
import { Flame } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <Link
        href="/"
        className="flex items-center gap-2 mb-10 text-zinc-300 hover:text-white transition-colors"
      >
        <Flame className="h-5 w-5 text-violet-400" />
        <span className="font-semibold tracking-tight">HypeShelf</span>
      </Link>

      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full max-w-sm",
            card: "bg-zinc-900 border border-zinc-800 shadow-xl shadow-black/40",
            headerTitle: "text-zinc-50",
            headerSubtitle: "text-zinc-400",
            formFieldLabel: "text-zinc-300",
            formFieldInput:
              "bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500",
            formButtonPrimary:
              "bg-violet-600 hover:bg-violet-500 focus:ring-violet-500",
            footerActionText: "text-zinc-400",
            footerActionLink: "text-violet-400 hover:text-violet-300",
            identityPreviewText: "text-zinc-300",
            identityPreviewEditButton: "text-violet-400",
          },
        }}
      />
    </div>
  );
}
