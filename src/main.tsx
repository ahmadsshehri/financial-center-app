import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { isMissingConfig } from './firebase/firebaseConfig';
import './styles/globals.css';

const MissingConfigPage = () => (
  <div dir="rtl" style={{ fontFamily: 'system-ui, Tahoma, Arial, sans-serif' }}
    className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-8 text-center"
  >
    <div className="max-w-md rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
      <div className="mb-4 text-5xl">⚙️</div>
      <h1 className="mb-2 text-xl font-bold text-slate-900">إعداد Firebase مطلوب</h1>
      <p className="mb-4 text-sm text-slate-500 leading-relaxed">
        متغيرات Firebase غير موجودة في بيئة النشر.
      </p>
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-right space-y-2">
        <p className="text-xs font-bold text-amber-800">الخطوات:</p>
        <ol className="text-xs text-amber-700 leading-relaxed list-decimal list-inside space-y-1">
          <li>افتح Vercel → مشروعك → Settings → Environment Variables</li>
          <li>أضف المتغيرات الستة: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID</li>
          <li>اذهب إلى Deployments → أحدث deployment → Redeploy</li>
        </ol>
      </div>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      {isMissingConfig ? <MissingConfigPage /> : <App />}
    </ErrorBoundary>
  </React.StrictMode>
);
