import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Compass } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ROUTES } from '../constants/routes';

export const WelcomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
        <div className="flex flex-1 flex-col justify-center">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Compass size={30} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">المركز المالي</h1>
            <p className="mt-2 text-base text-slate-500">
              نظام هادئ لإدارة مالك عبر مراكز واضحة
            </p>
          </div>

          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <p className="text-sm leading-7 text-slate-700">
              لا يقسّم التطبيق مالك إلى محافظ كثيرة، بل إلى ستة مراكز مالية تساعدك على
              معرفة من أين تصرف، وكيف توازن، وأين تستعد للفرص. الهدف بناء عادة مالية
              متينة خلال 40 يومًا أولى، ثم الانتقال إلى إيقاع أسبوعي أكثر مرونة.
            </p>
            <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
              <Lock size={18} className="mt-0.5 shrink-0 text-slate-500" />
              <p className="text-xs leading-6 text-slate-600">
                خصوصيتك أولًا: بياناتك المالية مخزّنة في حسابك الخاص فقط، ولا يطّلع عليها
                أحد سواك.
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-slate-500" />
              <p className="text-xs leading-6 text-slate-600">
                مؤشر صحة مالية مبني على قواعد واضحة، يساعدك على فهم وضعك دون أحكام.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <Button fullWidth onClick={() => navigate(ROUTES.REGISTER)}>
            إنشاء حساب جديد
          </Button>
          <Button variant="secondary" fullWidth onClick={() => navigate(ROUTES.LOGIN)}>
            لديّ حساب بالفعل
          </Button>
        </div>
      </div>
    </div>
  );
};
