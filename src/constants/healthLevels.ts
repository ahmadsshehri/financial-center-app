import { HealthLevel } from '../types/health';

export const HEALTH_LEVELS: HealthLevel[] = [
  { level: 1, min: 0, max: 20, label: 'خطر مالي حاد', color: '#DC2626', bgColor: '#FEF2F2', description: 'وضعك المالي يحتاج تدخلاً فورياً' },
  { level: 2, min: 21, max: 35, label: 'ضغط مالي مرتفع', color: '#D97706', bgColor: '#FFFBEB', description: 'هناك ضغط مالي واضح يستوجب المراجعة' },
  { level: 3, min: 36, max: 50, label: 'وضع غير مستقر', color: '#F59E0B', bgColor: '#FFFBEB', description: 'وضعك المالي يحتاج إلى تحسين' },
  { level: 4, min: 51, max: 65, label: 'قابل للتحسن', color: '#CA8A04', bgColor: '#FEFCE8', description: 'أنت في المسار الصحيح، استمر في التحسين' },
  { level: 5, min: 66, max: 78, label: 'مستقر', color: '#65A30D', bgColor: '#F7FEE7', description: 'وضعك المالي مستقر بشكل عام' },
  { level: 6, min: 79, max: 90, label: 'جيد جدًا', color: '#16A34A', bgColor: '#F0FDF4', description: 'وضعك المالي جيد جداً' },
  { level: 7, min: 91, max: 100, label: 'متقدم مالياً', color: '#1D4ED8', bgColor: '#EFF6FF', description: 'أنت تحقق التقدم المالي المطلوب' },
];

export const getHealthLevel = (score: number): HealthLevel => {
  return HEALTH_LEVELS.find((l) => score >= l.min && score <= l.max) || HEALTH_LEVELS[0];
};
