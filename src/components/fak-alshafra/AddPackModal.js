import React, { useState } from 'react';

export default function AddPackModal({ isOpen, onClose, onSavePack }) {
  const [packName, setPackName] = useState("");
  const [packText, setPackText] = useState("");
  const [saveLocal, setSaveLocal] = useState(true); // مفعل كافتراضي
  const [savePublic, setSavePublic] = useState(false);
  
  // 🚀 المتغيرات الجديدة لصاحب الحزمة
  const [authorName, setAuthorName] = useState("");
  const [socialHandle, setSocialHandle] = useState("");

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setPackText(event.target.result);
    reader.readAsText(file);
  };

  const handleSave = () => {
    if (!packName.trim()) return alert("⚠️ الرجاء كتابة اسم الحزمة!");
    const words = packText.split(/[\n,]+/).map(w => w.trim()).filter(w => w.length > 0);
    if (words.length < 25) return alert(`⚠️ نحتاج 25 كلمة كحد أدنى. (الحالي: ${words.length})`);
    if (!saveLocal && !savePublic) return alert("⚠️ لازم تختار مكان واحد على الأقل لحفظ الحزمة!");
    
    // 🚀 إرسال البيانات كاملة مع اسم الصانع وحسابه
    onSavePack(packName.trim(), words, saveLocal, savePublic, authorName.trim(), socialHandle.trim());
    
    // تصفير الخانات
    setPackName(""); setPackText(""); setAuthorName(""); setSocialHandle(""); 
    setSaveLocal(true); setSavePublic(false);
  };

  return (
    <div className="fixed inset-0 z-[6000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* الهيدر */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/80">
          <h3 className="text-base sm:text-lg font-black text-teal-400">إضافة حزمة جديدة 📦</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-7 h-7 rounded-full flex items-center justify-center transition-colors text-xs">✕</button>
        </div>

        {/* المحتوى */}
        <div className="p-4 overflow-y-auto space-y-5 hide-scroll" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`.hide-scroll::-webkit-scrollbar { display: none; }`}</style>
          
          {/* اسم الحزمة */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 px-1">اسم الحزمة <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={packName}
              onChange={(e) => setPackName(e.target.value)}
              placeholder="مثال: حزمة الأنمي، كلمات كروية..." 
              className="w-full bg-[#020617] border border-slate-700 rounded-xl p-3 text-xs font-bold text-slate-200 outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          {/* 🚀 الخانات الإضافية (باهتة وغير ملفتة - اختياري) */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input 
                type="text" 
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="اسمك كصانع (اختياري)" 
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-2.5 text-[10px] font-bold text-slate-400 outline-none focus:border-slate-600 transition-colors placeholder-slate-600"
              />
            </div>
            <div>
              <input 
                type="text" 
                value={socialHandle}
                onChange={(e) => setSocialHandle(e.target.value)}
                placeholder="حسابك للتواصل (اختياري)" 
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-2.5 text-[10px] font-bold text-slate-400 outline-none focus:border-slate-600 transition-colors placeholder-slate-600"
              />
            </div>
          </div>

          {/* خيارات الحفظ المتعددة (Checkboxes) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 px-1">خيارات الحفظ (تقدر تختارهم كلهم)</label>
            <div className="flex flex-col gap-2">
              
              {/* خيار الحفظ المحلي */}
              <button 
                onClick={() => setSaveLocal(!saveLocal)} 
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${saveLocal ? 'bg-slate-800 border-teal-500 shadow-sm' : 'bg-[#020617] border-slate-800 opacity-60'}`}
              >
                <div className="flex items-center gap-3 text-right">
                  <span className="text-lg">🔒</span>
                  <div className="flex flex-col">
                    <span className={`text-xs font-black ${saveLocal ? 'text-teal-400' : 'text-slate-400'}`}>مكتبتي الخاصة</span>
                    <span className="text-[9px] font-bold text-slate-500">تنحفظ بجهازك وتلعبها بأي وقت</span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${saveLocal ? 'bg-teal-500 border-teal-500 text-white' : 'bg-slate-800 border-slate-700'}`}>
                  {saveLocal && '✓'}
                </div>
              </button>

              {/* خيار النشر للعامة */}
              <button 
                onClick={() => setSavePublic(!savePublic)} 
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${savePublic ? 'bg-teal-900/30 border-teal-500 shadow-sm' : 'bg-[#020617] border-slate-800 opacity-60'}`}
              >
                <div className="flex items-center gap-3 text-right">
                  <span className="text-lg">🌍</span>
                  <div className="flex flex-col">
                    <span className={`text-xs font-black ${savePublic ? 'text-teal-400' : 'text-slate-400'}`}>المكتبة العامة</span>
                    <span className="text-[9px] font-bold text-slate-500">ترسل للإدارة لتنزل لكل اللاعبين</span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${savePublic ? 'bg-teal-500 border-teal-500 text-white' : 'bg-slate-800 border-slate-700'}`}>
                  {savePublic && '✓'}
                </div>
              </button>

            </div>
          </div>

          {/* الكلمات */}
          <div>
            <div className="flex justify-between items-end mb-1.5 px-1">
              <label className="text-[10px] font-bold text-slate-400">الكلمات <span className="text-red-500">*</span></label>
              <label className="cursor-pointer text-[9px] bg-slate-800 hover:bg-slate-700 text-teal-400 px-2 py-1 rounded-lg border border-slate-700 transition-colors font-bold flex items-center gap-1 shadow-sm">
                <span>رفع ملف txt</span>
                <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            
            {/* 🚀 مربع التوضيح البصري الجديد (كيف يكتب الكلمات) */}
            <div className="bg-slate-950 border border-slate-800 rounded-t-xl p-2 flex items-center gap-3 text-[9px] font-bold text-slate-500 border-b-0">
              <span className="text-teal-500 shrink-0">الطريقة الصحيحة:</span>
              <div className="flex flex-col leading-tight border-r border-slate-700 pr-2">
                <span>تفاحة</span>
                <span className="text-slate-600 border-b border-dashed border-slate-700 w-4 my-[1px]"></span>
                <span>سيارة</span>
              </div>
              <span className="mx-1">أو بفاصلة</span>
              <span className="border-r border-slate-700 pr-2">تفاحة، سيارة، كتاب</span>
            </div>
            
            <textarea 
              value={packText}
              onChange={(e) => setPackText(e.target.value)}
              className="w-full h-32 bg-[#020617] border border-slate-700 rounded-b-xl rounded-t-none p-3 text-xs font-bold text-slate-200 outline-none focus:border-teal-500 transition-colors resize-none leading-relaxed"
              placeholder="اكتب كلماتك هنا..."
            />
            
            <div className="mt-2 text-center text-[10px] font-black">
              <span className={packText.split(/[\n,]+/).filter(w => w.trim()).length >= 25 ? 'text-green-500 bg-green-900/20 px-2 py-1 rounded-full' : 'text-red-400 bg-red-900/20 px-2 py-1 rounded-full'}>
                عدد الكلمات: {packText.split(/[\n,]+/).filter(w => w.trim()).length} / 25
              </span>
            </div>
          </div>

        </div>

        {/* زر الحفظ */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80">
          <button 
            onClick={handleSave} 
            className="w-full bg-gradient-to-br from-teal-500 to-teal-700 text-white font-black py-3.5 rounded-xl shadow-lg hover:from-teal-400 hover:to-teal-600 transition-all active:scale-95 text-sm"
          >
            حفظ الحزمة 💾
          </button>
        </div>

      </div>
    </div>
  );
}