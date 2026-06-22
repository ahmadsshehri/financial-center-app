import { Component, ReactNode, ErrorInfo } from 'react';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          dir="rtl"
          className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-8 text-center"
        >
          <div className="max-w-md rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
            <div className="mb-4 text-4xl">⚠️</div>
            <h1 className="mb-2 text-xl font-bold text-slate-900">
              تعذّر تحميل التطبيق
            </h1>
            <p className="mb-4 text-sm text-slate-500 leading-relaxed">
              {this.state.error.message}
            </p>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-right">
              <p className="text-xs font-semibold text-amber-800 mb-2">الحل:</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                اذهب إلى إعدادات مشروعك في Vercel ← Environment Variables وأضف متغيرات Firebase الستة من مشروعك في Firebase Console.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
