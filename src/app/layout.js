import './globals.css'
import { Analytics } from "@vercel/analytics/react"
import ClientLayout from "./ClientLayout" // هذا الملف سننشئه في الخطوة القادمة

// 🚀 هذا القسم هو المسؤول عن ظهور الرابط بشكل فخم في الواتساب وتويتر وقوقل
export const metadata = {
  title: 'الدروازة | بوابة الألعاب الجماعية 🎮',
  description: 'العب "فك الشفرة" الآن! تحدي ذكاء وسرعة بديهة بين فريقين. شفر الكلمات، فك الشفرات، واستمتع مع أخوياك أونلاين مجاناً.',
  keywords: ['الدروازة', 'لعبة فك الشفرة', 'ألعاب جماعية', 'ألعاب عربية', 'تحدي ذكاء'],
  openGraph: {
    title: 'الدروازة | فك الشفرة 🔍',
    description: 'تحدي الفرق الأقوى! هل تقدر تفك الشفرة؟ العبها الآن مع أخوياك.',
    url: 'https://aldarwaza.online',
    siteName: 'الدروازة',
    images: [
      {
        url: 'https://aldarwaza.online/og-image.png', 
        width: 1200,
        height: 630,
        alt: 'لوغو لعبة الدروازة',
      },
    ],
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'الدروازة | فك الشفرة 🔍',
    description: 'أول بوابة ألعاب جماعية عربية - العب فك الشفرة الآن!',
    images: ['https://aldarwaza.online/og-image.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {/* استدعاء ملف التفاعل */}
        <ClientLayout>
          {children}
        </ClientLayout>
        
        {/* 📊 إحصائيات فيرسل */}
        <Analytics />
      </body>
    </html>
  )
}