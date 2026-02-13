'use client';

import { Component, type ReactNode } from 'react';

interface AnalysisErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class AnalysisErrorBoundary extends Component<AnalysisErrorBoundaryProps, State> {
  constructor(props: AnalysisErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Analysis section error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <section
          className="bg-red-50 border border-red-200 rounded-xl p-6"
          role="alert"
          aria-live="assertive"
        >
          <h3 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h3>
          <p className="text-red-700 text-sm mb-3">
            The analysis or results section encountered an error. You can try changing your data or
            selections and try again.
          </p>
          <p className="text-red-600 text-xs font-mono truncate" title={this.state.error.message}>
            {this.state.error.message}
          </p>
        </section>
      );
    }
    return this.props.children;
  }
}
