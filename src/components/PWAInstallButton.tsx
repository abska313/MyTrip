import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] px-3.5 py-1.5 text-xs font-bold text-[#F4F0F1] shadow-lg shadow-[#6D1028]/25 hover:opacity-90 active:scale-95 transition ${className}`}
        title="تثبيت التطبيق على جهازك للعمل دون إنترنت"
      >
        <Download className="w-3.5 h-3.5" />
        <span>تثبيت التطبيق</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-2 rounded-xl border border-[#30262B] bg-[#151316] px-3 py-1.5 text-xs font-semibold text-[#AAA2A7] hover:text-[#F4F0F1] hover:border-[#6D1028] transition ${className}`}
          title="طريقة التثبيت على آيفون"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#922D48]" />
          <span>تثبيت PWA</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#151316] border border-[#30262B] p-6 shadow-2xl text-right">
              <div className="flex items-center justify-between pb-3 border-b border-[#30262B]">
                <h3 className="text-base font-bold text-[#F4F0F1]">تثبيت التطبيق على آيفون / آيباد</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-[#AAA2A7] hover:text-[#F4F0F1] hover:bg-[#30262B]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs leading-relaxed text-[#AAA2A7]">
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#6D1028] text-white flex items-center justify-center font-bold text-[10px]">1</span>
                  <span>اضغط على زر <strong>المشاركة (Share)</strong> في شريط متصفح Safari بالأسفل.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#6D1028] text-white flex items-center justify-center font-bold text-[10px]">2</span>
                  <span>مرر القائمة للأسفل واختر <strong>«إضافة إلى الشاشة الرئيسية» (Add to Home Screen)</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#6D1028] text-white flex items-center justify-center font-bold text-[10px]">3</span>
                  <span>اضغط <strong>إضافة (Add)</strong>، وسيفتح التطبيق كشاشة كاملة دون متصفح حتى بدون إنترنت!</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-[#6D1028] py-2.5 text-xs font-bold text-white hover:bg-[#922D48] transition"
              >
                فهمت، إغلاق
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
