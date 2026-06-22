# المركز المالي (financial-center-app)

تطبيق ويب لإدارة المال عبر ستة مراكز مالية، مبني على React + TypeScript + Vite + Tailwind + Firebase.

## الفكرة
بدلًا من تقسيم المال إلى محافظ كثيرة، يوزّع التطبيق الدخل على ستة مراكز:
المصاريف، التوازن، الصدقة، الاستعداد، الديون، والفائض. يبني عادة مالية خلال 40 يومًا
عبر مهام يومية، ويحسب مؤشر صحة مالية قائم على قواعد واضحة (بدون أي اتصال بنماذج ذكاء اصطناعي).

## التقنيات
- React 18 + TypeScript + Vite
- Tailwind CSS (دعم RTL وخطوط عربية)
- Firebase Auth + Firestore
- React Router v6
- lucide-react, date-fns, clsx

## الإعداد
1. `npm install`
2. انسخ `.env.example` إلى `.env` واملأ مفاتيح Firebase:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
3. فعّل Email/Password في Firebase Authentication.
4. انشر قواعد Firestore من `firestore.rules`.
5. `npm run dev`

## السكربتات
- `npm run dev` — تشغيل بيئة التطوير
- `npm run build` — بناء الإنتاج
- `npm run preview` — معاينة البناء

## البنية
- `src/firebase` — تهيئة Firebase وخدمات المصادقة و Firestore
- `src/hooks` — خطافات البيانات (المستخدم، المراكز، المهام، الصحة)
- `src/components` — مكونات الواجهة والتخطيط
- `src/pages` — الصفحات العشر
- `src/constants` — المراكز الافتراضية ومستويات الصحة والمسارات
- `src/utils` — الحسابات والتواريخ والتنسيق والتحقق

## الأمان
قواعد Firestore تضمن وصول كل مستخدم إلى بياناته فقط (`users/{uid}` وكل المجموعات الفرعية).
