"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  text?: string;
  loadingText?: string;
}

export function SubmitButton({ text = "Upload & Save Product", loadingText = "Uploading & Saving..." }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2 rounded-md text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors flex items-center justify-center min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingText}
        </>
      ) : (
        text
      )}
    </button>
  );
}
