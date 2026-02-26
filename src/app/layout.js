import './globals.css'

export const metadata = {
  title: 'الدروازة',
  description: 'منصة الدروازة للألعاب - فك الشفرة واقلط',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#F5E6CA] text-[#5D2E0A] font-sans min-h-screen flex flex-col">
        
        {/* الهيدر الثابت */}
        <header className="sticky top-0 z-50 bg-[#EAD7B1] border-b-4 border-[#8B4513] shadow-md py-4 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-3 items-center">
            
            {/* اليمين: زر اللعبة */}
            <div className="flex justify-start">
              <button className="flex items-center gap-2 bg-[#8B4513] text-[#F5E6CA] px-4 py-2 rounded-md font-bold hover:bg-[#5D2E0A] transition shadow-sm">
                <span>فك الشفرة</span>
                <span className="text-xs">▼</span>
              </button>
            </div>

            {/* المنتصف: اسم الموقع */}
            <div className="flex justify-center">
              <h1 className="text-3xl font-black tracking-tighter cursor-pointer hover:scale-105 transition-transform">
                الدروازة
              </h1>
            </div>

            {/* اليسار: المساحة الفاضية */}
            <div className="flex justify-end">
              {/* مساحة فاضية */}
            </div>

          </div>
        </header>

        {/* منطقة العمل */}
        <main className="flex-grow p-4 md:p-8">
          {children}
        </main>

      </body>
    </html>
  )
}