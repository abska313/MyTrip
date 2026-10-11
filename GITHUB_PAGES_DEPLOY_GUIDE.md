# دليل حل مشكلة الشاشة البيضاء وضبط مسارات الموارد على GitHub Pages

يقدم هذا الدليل شرحًا عمليًا وتفصيليًا لكيفية ضبط مسارات الموارد في مشاريع Vite و PWA عند استضافتها على **GitHub Pages**، لتفادي ظهور الشاشة البيضاء (White Screen) وأخطاء 404 الناتجة عن اختلاف المسارات.

---

## 📌 جوهر المشكلة: لماذا تظهر الشاشة البيضاء؟

عند استضافة الموقع على خادم عادي أو محلي، يكون المسار الجذري هو نطاق الموقع مباشرة:
`https://mysite.com/`

لكن على **GitHub Pages**، غالبًا ما يُستضاف المشروع داخل **مجلد فرعي (Subpath)** يحمل اسم المستودع (Repository Name):
`https://<username>.github.io/<repository-name>/`

إذا كانت إعدادات المشروع تطلب الملفات من المسار الجذري المطلق (`/assets/...` أو `/icon.svg`)، فسيقوم المتصفح بطلبها من:
`https://<username>.github.io/assets/...` (وهذا غير موجود ❌)
بدلاً من:
`https://<username>.github.io/<repository-name>/assets/...` (المسار الصحيح ✅)

ينتج عن ذلك خطأ **404 Not Found** لملفات الجافاسكريبت والـ CSS، فتتوقف الصفحة تمامًا وتظهر **شاشة بيضاء فارغة**.

---

## 🛠️ الخطوة 1: ضبط مسار الأساس في `vite.config.ts`

لجعل أداة البناء **Vite** تُنشئ روابط نسبية ذكية تعمل داخل أي مجلد فرعي أو نطاق مخصص، يجب تعديل خيار `base`:

افتح ملف `vite.config.ts` وتأكد من وجود السطر التالي داخل دالة الإعداد:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    // 💡 هذا السطر هو الأهم: يجعل جميع الروابط تبدأ بـ ./ بدلاً من /
    base: './', 
    
    plugins: [
      react(),
      // بقية الإضافات...
    ],
  };
});
```

> **ملاحظة بديلة:** إذا كنت تعرف اسم المستودع بالضبط (مثلاً `ABSKA-214`) وتريد تثبيته، يمكنك كتابته هكذا:
> `base: '/ABSKA-214/'`
> ولكن استخدام `base: './'` هو الحل الأكثر مرونة لأنه يعمل محليًا وعلى أي مسار دون الحاجة لتغيير اسم المستودع يدويًا.

---

## 🛠️ الخطوة 2: فحص وتعديل الروابط في `index.html`

افتح ملف `index.html` في جذر المشروع، وتأكد أن جميع وسوم `<link>` و `<script>` تستخدم مسارات نسبية تبدأ بنقطة (`./`) وليس بشرطة مائلة فقط (`/`):

### ❌ قبل التعديل (يسبب 404 على GitHub Pages):
```html
<link rel="icon" type="image/svg+xml" href="/icon.svg" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.webmanifest" />
```

### ✅ بعد التعديل (يعمل بشكل صحيح):
```html
<link rel="icon" type="image/svg+xml" href="./icon.svg" />
<link rel="apple-touch-icon" href="./apple-touch-icon.png" />
<link rel="manifest" href="./manifest.webmanifest" />
```

---

## ⚠️ الخطوة 3: تنبيهات بالغة الأهمية بخصوص `manifest.webmanifest` (تطبيقات PWA)

ملف الـ Manifest مسؤول عن تثبيت التطبيق والعمل دون إنترنت. في بيئة المجلدات الفرعية على GitHub Pages، إذا تم ضبط `start_url` و `scope` على `/`، فسيفشل تثبيت الـ PWA أو يفتح المتصفح الصفحة الرئيسية لحسابك بدلاً من تطبيقك!

افتح ملف `public/manifest.webmanifest` وتأكد من الآتي:

### 1. ضبط `start_url` و `scope`
- **لا تستخدم:** `"start_url": "/"` أو `"scope": "/"`
- **استخدم المسار النسبي:**
  ```json
  "start_url": "./",
  "scope": "./",
  "id": "./"
  ```

### 2. مسارات الأيقونات (Icons)
تأكد أن مسارات الأيقونات داخل مصفوفة `icons` تبدأ بـ `./`:

```json
{
  "id": "./",
  "name": "ABSKA — 214 التحوّل الشامل",
  "short_name": "ABSKA 214",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "icons": [
    {
      "src": "./pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "./pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "./pwa-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

> **تنبيه:** إذا كانت إعدادات VitePWA تُدار من داخل `vite.config.ts`، تأكد أيضًا من تعديل قسم `manifest` داخل الـ Plugin بنفس الطريقة.

---

## 🚀 الخطوة 4: ضبط إعدادات النشر على GitHub Pages

هناك طريقتان لنشر الموقع على GitHub Pages:

### الخيار (أ): عبر GitHub Actions (الأفضل والأحدث — تلقائي 100%)
هذا الخيار يتولى عملية تشغيل أمر البناء `npm run build` ونشر مجلد `dist` المحسّن تلقائيًا عند كل تعديل.

1. تأكد من وجود ملف `.github/workflows/deploy.yml` في مستودعك (الملف تم إنشاؤه مسبقًا في مشروعك).
2. افتح مستودعك على موقع **GitHub**.
3. ادخل على تبويب **Settings** (الإعدادات).
4. من القائمة الجانبية اختر **Pages**.
5. تحت قسم **Build and deployment**:
   - في خانة **Source**: اختر **GitHub Actions** بدلاً من *Deploy from a branch*.
6. بمجرد اختيارها، ستبدأ عملية البناء التلقائية في تبويب **Actions**، وخلال دقيقة سيظهر رابط موقعك ويعمل مباشرة.

---

### الخيار (ب): النشر اليدوي عبر فرع `gh-pages`
إذا اخترت النشر التقليدي من الفرع:
1. قم ببناء المشروع محليًا أولاً:
   ```bash
   npm run build
   ```
2. **انتبه:** لا تقم بنشر ملفات الكود المصدري (`src/`) على GitHub Pages، بل انشر **محتويات مجلد `dist` فقط**.
3. يمكنك استخدام مكتبة `gh-pages` المساعدة:
   ```bash
   npm install -D gh-pages
   ```
4. أضف سطرًا في `package.json` تحت `scripts`:
   ```json
   "deploy": "gh-pages -d dist"
   ```
5. ثم نفّذ:
   ```bash
   npm run deploy
   ```
6. من إعدادات GitHub Pages، اختر الفرع **gh-pages** والمجلد **/ (root)**.

---

## 🔍 قائمة الفحص السريع (Checklist) قبل النشر

قبل إطلاق الموقع، راجع النقاط التالية:
- [x] تم إضافة `base: './'` في `vite.config.ts`.
- [x] جميع وسوم `<link>` و `<script>` في `index.html` تستخدم `./`.
- [x] ملف `manifest.webmanifest` يستخدم `"start_url": "./"` و `"scope": "./"`.
- [x] مسارات أيقونات الـ PWA تبدأ بـ `./pwa-...`.
- [x] تم اختيار **GitHub Actions** كمصدر للنشر في إعدادات GitHub Pages.
- [x] التأكد من عمل أمر `npm run build` محليًا دون أي أخطاء برمجية.

باتباع هذه الخطوات، سيتحمل تطبيقك بسلاسة وسرعة فائقة على GitHub Pages ولن تواجه مشكلة الشاشة البيضاء مجددًا.
