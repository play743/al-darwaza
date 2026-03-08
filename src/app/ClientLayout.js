"use client"; 

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ClientLayout({ children }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // إغلاق القائمة تلقائياً عند تغيير الصفحة
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [pathname]);

  return (
    <div className="bg-[#020617] text-slate-200 font-sans min-h-screen flex flex-col">
      <header className="sticky top-0 z-[6000] bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg py-3 sm:py-4 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* اليمين: زر ألعابنا */}
          <div className="flex justify-start relative z-50">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 text-slate-200 px-3 sm:px-4 py-2 rounded-xl font-bold hover:bg-slate-700 hover:text-teal-400 transition-all shadow-sm text-[11px] sm:text-sm outline-none whitespace-nowrap"
            >
              <span>{isHomePage ? "ألعابنـا 🎮" : "فك الشفرة 🔍"}</span>
              <span className={`text-[8px] sm:text-[10px] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {/* القائمة المنسدلة */}
            {isDropdownOpen && (
              <div className="absolute top-full mt-2 right-0 w-40 sm:w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-2 flex flex-col gap-1">
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-500 px-3 py-1 uppercase tracking-widest">اختر اللعبة</p>
                  <Link href="/games/fak-alshafra" className="flex items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 transition-colors group">
                    <span className="text-xs sm:text-sm font-bold group-hover:text-teal-400">فك الشفرة 🔍</span>
                  </Link>
                  <div className="border-t border-slate-800 my-1"></div>
                  <button disabled className="flex items-center gap-2 sm:gap-3 px-3 py-2.5 rounded-xl opacity-40 cursor-not-allowed">
                    <span className="text-xs sm:text-sm font-bold italic">قريباً... ⏳</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* المنتصف: شعار الدروازة */}
          <div className="flex justify-center flex-1">
            <Link href="/">
              <h1 className="text-xl sm:text-3xl font-black tracking-widest text-teal-400 cursor-pointer hover:scale-105 hover:text-teal-300 transition-all drop-shadow-md whitespace-nowrap">
                الدروازة
              </h1>
            </Link>
          </div>

          {/* اليسار: زر تطوير الموقع */}
          <div className="flex justify-end items-center">
            <a 
              href="https://docs.google.com/forms/d/e/1FAIpQLSeQabOUnRPa40dQkm7SqvrW-3YiCGtwi2r3wecDmdPEassO3A/viewform?usp=dialog" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 sm:gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 px-3 sm:px-4 py-2 rounded-xl font-bold hover:bg-teal-500 hover:text-white transition-all shadow-sm text-[11px] sm:text-sm whitespace-nowrap"
            >
              <span>تطوير</span>
              <span className="hidden sm:inline">🛠️</span>
            </a>
          </div>

        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="flex-grow w-full" onClick={() => setIsDropdownOpen(false)}>
        {children}
      </main>
    </div>
  )
}