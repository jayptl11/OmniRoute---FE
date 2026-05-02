import { Outlet } from 'react-router-dom';
import { GitBranch, Globe } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-slate-50">
      {/* Centered Floating Card */}
      <div className="w-full max-w-[1080px] bg-white rounded-md shadow-lg shadow-slate-200/50 flex overflow-hidden relative z-10 border border-slate-200 min-h-[640px]">
        
        {/* ── Left panel: white form area ───────────────────────────── */}
        <main className="flex-1 flex items-center justify-center p-8 lg:p-14 relative overflow-hidden bg-white">
          <div className="w-full max-w-[420px]">
            <Outlet />
          </div>
        </main>

        {/* ── Right panel: dynamic brand column ─────────────────────────── */}
        <aside className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 bg-slate-50/50 border-l border-slate-200 p-12">
          {/* Logo */}
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded bg-red-50 border border-red-100 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-red-600" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                OmniRoute
              </span>
            </div>

            {/* Eyebrow + heading */}
            <p className="text-xs font-semibold tracking-widest uppercase text-red-600/80 mb-3">
              Hệ thống Thông minh
            </p>
            <h2 className="text-3xl font-bold leading-snug mb-10 text-slate-900">
              Phân luồng Khách hàng{' '}
              <span className="text-red-600">
                Đa kênh
              </span>{' '}
              Tự động
            </h2>

            {/* Bento feature grid */}
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded p-5 border border-slate-200 hover:border-red-200 transition-colors">
                <GitBranch className="w-5 h-5 text-red-600 mb-4" />
                <p className="text-sm font-semibold mb-1.5 text-slate-900">Định tuyến thông minh</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">Phân luồng tự động theo quy tắc nghiệp vụ</p>
              </div>

              <div className="bg-white rounded p-5 border border-slate-200 hover:border-red-200 transition-colors">
                <Globe className="w-5 h-5 text-red-600 mb-4" />
                <p className="text-sm font-semibold mb-1.5 text-slate-900">Đa kênh tích hợp</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">Hợp nhất mọi điểm tiếp xúc khách hàng</p>
              </div>
            </div>
          </div>

          {/* Footer — Viettel badge */}
          <div className="flex items-center gap-4 pt-8 mt-10 border-t border-slate-200">
            <div className="h-8 flex items-center justify-center shrink-0">
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e4/Logo_Viettel_2021.svg" alt="Viettel Logo" className="h-full object-contain" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Viettel Trading</p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-0.5">Thương mại & Xuất nhập khẩu</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}


