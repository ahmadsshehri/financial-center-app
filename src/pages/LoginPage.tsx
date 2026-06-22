import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { loginUser } from '../firebase/auth';
import { ROUTES } from '../constants/routes';
import { validateEmail } from '../utils/validators';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
    setLoading(true);
    try {
      await loginUser(email, password);
      navigate(ROUTES.DASHBOARD);
    } catch {
      setError('تعذّر تسجيل الدخول. تحقق من البريد وكلمة المرور.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">تسجيل الدخول</h1>
        <p className="mb-6 text-sm text-slate-500">أهلًا بعودتك إلى المركز المالي</p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="••••••••"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'جارٍ الدخول...' : 'دخول'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ليس لديك حساب؟{' '}
          <Link to={ROUTES.REGISTER} className="font-semibold text-slate-900">
            إنشاء حساب
          </Link>
        </p>
      </div>
    </div>
  );
};
