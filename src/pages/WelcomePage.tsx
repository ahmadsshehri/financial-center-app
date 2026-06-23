import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../hooks/useAuth';

export const WelcomePage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) navigate(ROUTES.DASHBOARD, { replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">

        {/* Logo + title */}
        <div className="flex flex-1 flex-col justify-center">
          <div className="mb-8 text-center">
            <img
              src="/logo.png"
              alt="المركز المالي"
              className="mx-auto mb-2 h-36 w-auto object-contain drop-shadow-lg"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
                const fallback = img.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            {/* Fallback if no logo file yet */}
            <div style={{ display: 'none' }} className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100 text-blue-800 text-4xl font-bold">
              م
            </div>
            <h1 className="text-3xl font-bold text-slate-900 drop-shadow">المركز المالي</h1>
            <p className="mt-2 text-base text-slate-500">
              مستشارك الشخصي لبناء مركز مالي أقوى
            </p>
          </div>

          {/* Info card */}
          <div className="space-y-4 rounded-2xl bg-slate-50 border border-slate-200 p-5">
            <p className="text-sm leading-7 text-slate-700">
              تعبت من ضياع الراتب ،، وماتعرف كيف انصرف ؟
              جربت برامج ادارة الميزانيه وفشلت؟
              تفضل معنا ناخذك برحلة سهله وجاده توصلك الى اهدافك المالية بإذن الله
            </p>
            <div className="flex items-start gap-3 rounded-xl bg-white border border-slate-200 p-3">
              <Lock size={17} className="mt-0.5 shrink-0 text-slate-400" />
              <p className="text-xs leading-6 text-slate-500">
                بياناتك المالية خاصة بك. لا يطلع عليها أحد.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <button
            onClick={() => navigate(ROUTES.REGISTER)}
            className="w-full rounded-xl bg-blue-700 py-3.5 text-base font-bold text-white shadow-lg hover:bg-blue-800 transition-colors"
          >
            ابدأ الآن
          </button>
          <button
            onClick={() => navigate(ROUTES.LOGIN)}
            className="w-full rounded-xl border border-slate-300 bg-white py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            لديّ حساب بالفعل
          </button>
        </div>
      </div>
    </div>
  );
};
