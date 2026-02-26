"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { X, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { GENRES } from "@/lib/genres";
import { cn } from "@/lib/utils";

interface AddRecommendationModalProps {
  onClose: () => void;
}

interface FormState {
  title: string;
  genre: string;
  link: string;
  blurb: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  genre: "",
  link: "",
  blurb: "",
};

/**
 * Modal dialog for adding a new recommendation.
 *
 * Client-side validation keeps UX snappy; server-side validation in the
 * Convex mutation is the security-critical path.
 */
export function AddRecommendationModal({ onClose }: AddRecommendationModalProps) {
  const addRecommendation = useMutation(api.recommendations.add);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the first input when modal opens.
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // Close on Escape.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  function validate(): boolean {
    const next: Partial<FormState> = {};

    if (!form.title.trim()) next.title = "Title is required.";
    else if (form.title.trim().length > 120) next.title = "Max 120 characters.";

    if (!form.genre) next.genre = "Please select a genre.";

    if (!form.link.trim()) {
      next.link = "Link is required.";
    } else {
      try {
        new URL(form.link.trim());
      } catch {
        next.link = "Must be a valid URL (include https://).";
      }
    }

    if (!form.blurb.trim()) next.blurb = "Write a short blurb.";
    else if (form.blurb.trim().length > 300) next.blurb = "Max 300 characters.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      await addRecommendation({
        title: form.title.trim(),
        genre: form.genre,
        link: form.link.trim(),
        blurb: form.blurb.trim(),
      });
      toast.success("Recommendation added!");
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Try again.";
      setServerError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  const field = (
    key: keyof FormState,
    value: string,
    extra?: object
  ) => ({
    value,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    ...extra,
  });

  const inputClass = (hasError: boolean) =>
    cn(
      "w-full rounded-lg px-3 py-2 text-sm",
      "text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500",
      "bg-gray-100 dark:bg-zinc-800 border transition-colors focus:outline-none",
      hasError
        ? "border-red-400/60 focus:border-red-400"
        : "border-gray-300 dark:border-zinc-700 focus:border-violet-500"
    );

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/50 animate-slide-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-violet-500 dark:text-violet-400" />
            <h2 id="modal-title" className="font-semibold text-gray-900 dark:text-zinc-100 text-sm">
              Add recommendation
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors focus-ring"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="px-5 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
              Title <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              ref={firstInputRef}
              type="text"
              placeholder="e.g. Dune: Part Two"
              maxLength={120}
              className={inputClass(!!errors.title)}
              {...field("title", form.title)}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Genre */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
              Genre <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <select
              className={cn(inputClass(!!errors.genre), "cursor-pointer")}
              {...field("genre", form.genre)}
            >
              <option value="" disabled>
                Select a genre…
              </option>
              {GENRES.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
            {errors.genre && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.genre}</p>
            )}
          </div>

          {/* Link */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
              Link <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              type="url"
              placeholder="https://letterboxd.com/film/dune-part-two"
              className={inputClass(!!errors.link)}
              {...field("link", form.link)}
            />
            {errors.link && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.link}</p>
            )}
          </div>

          {/* Blurb */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
              Short blurb <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Why are you hyped about this? (max 300 chars)"
              maxLength={300}
              className={cn(
                inputClass(!!errors.blurb),
                "resize-none leading-relaxed"
              )}
              value={form.blurb}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, blurb: e.target.value }));
                if (errors.blurb)
                  setErrors((prev) => ({ ...prev, blurb: undefined }));
              }}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.blurb ? (
                <p className="text-xs text-red-500 dark:text-red-400">{errors.blurb}</p>
              ) : (
                <span />
              )}
              <span
                className={cn(
                  "text-xs",
                  form.blurb.length > 280
                    ? "text-amber-500 dark:text-amber-400"
                    : "text-gray-400 dark:text-zinc-600"
                )}
              >
                {form.blurb.length}/300
              </span>
            </div>
          </div>

          {/* Server error */}
          {serverError && (
            <p className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-400/20 rounded-lg px-3 py-2">
              {serverError}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 rounded-lg transition-colors focus-ring"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors focus-ring flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Adding…
                </>
              ) : (
                "Add to shelf"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
