"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  /** Optional custom fallback UI. If omitted, a default error card is shown. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React error boundary — catches unhandled errors in the component tree
 * and renders a recovery UI instead of crashing the whole page.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production you would send this to an error reporting service.
    console.error("[ErrorBoundary] Uncaught error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-500/10 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500 dark:text-red-400" />
          </div>

          <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-100 mb-1">
            Something went wrong
          </h2>

          <p className="text-sm text-gray-500 dark:text-zinc-400 mb-1 max-w-sm">
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>

          <p className="text-xs text-gray-400 dark:text-zinc-600 mb-6">
            Your data is safe — this is a display error only.
          </p>

          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
