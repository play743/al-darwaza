import React from "react";

export default function AddPackModal({ isOpen, onClose, handleFileUpload, customPackText, setCustomPackText, saveCustomPack }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[4000] bg-[#020617]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl flex flex-col gap-4">
        <h3 className="text-slate-100 font-black text-sm uppercase text-center border-b border-slate-800 pb-3">إضافة حزمة 📦</h3>
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold bg-[#020617] p-3 rounded-xl text-center cursor-pointer border border-slate-700 text-teal-400 hover:border-teal-500 transition-colors">📂 رفع ملف (txt أو csv)<input type="file" accept=".txt,.csv" className="hidden" onChange={handleFileUpload} /></label>
          <div className="text-center text-[10px] text-slate-500 font-black my-1">أو</div>
          <textarea value={customPackText} onChange={(e) => setCustomPackText(e.target.value)} placeholder="اكتب الكلمات هنا، افصل بينها بفاصلة أو سطر جديد (أقل شيء 25 كلمة)" className="w-full h-32 bg-[#020617] border border-slate-700 rounded-xl p-3 text-xs font-bold outline-none resize-none text-slate-200 focus:border-teal-500 placeholder-slate-600"></textarea>
        </div>
        <div className="flex gap-2 mt-2">
          <button onClick={saveCustomPack} className="flex-1 bg-gradient-to-br from-teal-500 to-teal-700 text-white font-bold py-2.5 rounded-xl hover:from-teal-400 hover:to-teal-600 transition-colors">حفظ الحزمة</button>
          <button onClick={onClose} className="flex-1 bg-slate-800 border border-slate-700 text-slate-300 font-bold py-2.5 rounded-xl hover:bg-slate-700 transition-colors">إلغاء</button>
        </div>
      </div>
    </div>
  );
}