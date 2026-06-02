"use client";

import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() { return { hasError: true }; }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4">
          <p className="text-3xl mb-3">⚠️</p>
          <h2 className="text-base font-semibold mb-2">Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}
            className="text-xs text-[#9d97ff] hover:underline mt-2">Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
