import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { registerUser } from '../firebase/auth';
import { createUserProfile } from '../firebase/firestore';
import { ROUTES } from '../constants/routes';
import { validateEmail, validatePassword } from '../utils/validators';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('يرجى إدخال الاسم');
    if (!validateEmail(email)) return setError('يرجى إدخال بريد إلكتروني صحيح');
    if (!validatePassword(password))
      return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    if (password !== confirm) return setError('كلمتا المرور غير متطابقتين');

    setLoading(true);
    try {
      const user = await registerUser(email, password, name.trim());
      await createUserProfile(user.uid, {
        displayName: name.trim(),
        email,
        onboardingCompleted: false,
        stage: 'foundation',
        preferredMode: 'daily',
        healthScore: 0,
        healthLevel: 1,
        themeLevel: 1,
        fixedIncome: true,
      });
      navigate(ROUTES.ONBOARDING);
    } catch (err) {
      const msg = (err as { code?: string }).code;
      setError(
        msg === 'auth/email-already-in-use'
          ? 'هذا البريد مستخدم بالفعل'
          : 'تعذّر إنشاء الحساب. حاول مرة أخرى.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">إنشاء حساب</h1>
        <p className="mb-6 text-sm text-slate-500">ابدأ رحلتك المالية في 40 يومًا</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            label="الاسم"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسمك الكامل"
          />
          <Input
            id="email"
            type="email"
            label="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            dir="ltr"
            className="text-left"
          />
          <Input
            id="password"
            type="password"
            label="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6 أحرف على الأقل"
          />
          <Input
            id="confirm"
            type="password"
            label="تأكيد كلمة المرور"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="أعد إدخال كلمة المرور"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          لديك حساب؟{' '}
          <Link to={ROUTES.LOGIN} className="font-semibold text-slate-900">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
};
