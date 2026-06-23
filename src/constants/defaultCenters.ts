import { FinancialCenterKey } from '../types/center';

export const DEFAULT_CENTERS = [
  {
    key: 'expenses' as FinancialCenterKey,
    nameAr: 'المصاريف',
    descriptionAr:
      'المال المخصص للحياة اليومية والشهرية. لا نقسمه إلى محافظ كثيرة، بل نستخدم قواعد إرشادية تساعدك تعرف من أين تصرف.',
    percentage: 42.5,
    order: 1,
  },
  {
    key: 'balance' as FinancialCenterKey,
    nameAr: 'التوازن',
    descriptionAr:
      'احتياطي داخلي لسد العجز عند الضرورة. الهدف أن يصل إلى ما يعادل دخل 3 أشهر. لا يُستخدم إلا عند الحاجة.',
    percentage: 17.5,
    order: 2,
  },
  {
    key: 'charity' as FinancialCenterKey,
    nameAr: 'الصدقة',
    descriptionAr:
      'مركز للبركة والامتنان وشكر الله بالعمل. يمكنك تعديل نسبته أو تصفيره، لكن وجوده يذكرك بالمعنى والبركة.',
    percentage: 2.5,
    order: 3,
  },
  {
    key: 'readiness' as FinancialCenterKey,
    nameAr: 'الاستعداد',
    descriptionAr:
      'مال مخصص للفرص التي قد ترفع دخلك أو تبني أصلًا. يشبه صندوق الفرص أو المال الجريء الشخصي.',
    percentage: 5,
    order: 4,
  },
  {
    key: 'debts' as FinancialCenterKey,
    nameAr: 'الديون',
    descriptionAr:
      'مركز يساعدك على الانتقال من الديون الاستهلاكية إلى الديون الاستثمارية وتجهيز القدرة المالية للفرص منخفضة أو متوسطة المخاطر.',
    percentage: 32.5,
    order: 5,
  },
];
