import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/features/auth';
import { GitBranch, Users, Activity, BarChart3, ArrowUpRight, LogOut } from 'lucide-react';
import { getRoleLabel } from '@/lib/roleChannel';

const statCards = [
  { label: 'Tổng yêu cầu hôm nay', value: '—', icon: Activity, iconColor: '#80A1C1', iconBg: 'bg-[#80A1C1]/10' },
  { label: 'Đang xử lý', value: '—', icon: GitBranch, iconColor: '#80A1C1', iconBg: 'bg-[#80A1C1]/10' },
  { label: 'Nhân viên trực tuyến', value: '—', icon: Users, iconColor: '#80A1C1', iconBg: 'bg-[#80A1C1]/10' },
  { label: 'Hiệu suất hôm nay', value: '—', icon: BarChart3, iconColor: '#80A1C1', iconBg: 'bg-[#80A1C1]/10' },
];

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Topbar */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0F172A] flex items-center justify-center">
              <GitBranch className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-[#111827] text-sm tracking-tight">OmniRoute</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[#111827] leading-tight">{user?.username}</p>
              <p className="text-xs text-[#6B7280]">{user?.email}</p>
            </div>
            {user?.roleName && (
              <span className="inline-flex items-center rounded-md bg-[#80A1C1]/10 px-2.5 py-1 text-xs font-medium text-[#4d7fa3]">
                {getRoleLabel(user.roleName, user.roleDisplayName)}
              </span>
            )}
            <button
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-sm font-medium text-[#374151] transition hover:bg-[#F9FAFB] hover:border-gray-300 disabled:opacity-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {logout.isPending ? 'Đang xuất...' : 'Đăng xuất'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Welcome */}
        <div className="mb-7">
          <h1 className="text-xl font-bold text-[#111827]">
            Xin chào,{' '}
            <span className="text-[#80A1C1]">{user?.username}</span> 👋
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Tổng quan hệ thống phân luồng khách hàng OmniRoute.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map(({ label, value, icon: Icon, iconColor, iconBg }) => (
            <div key={label} className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-sm">
              <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center mb-3`}>
                <Icon className="w-4 h-4" style={{ color: iconColor }} />
              </div>
              <p className="text-2xl font-bold text-[#111827]">{value}</p>
              <p className="text-xs text-[#6B7280] mt-1 leading-snug">{label}</p>
            </div>
          ))}
        </div>

        {/* Bento chart placeholders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-0.5">Biểu đồ</p>
                <h3 className="font-semibold text-[#111827] text-sm">Lưu lượng yêu cầu theo giờ</h3>
              </div>
              <button className="flex items-center gap-1 text-xs text-[#80A1C1] hover:text-[#4d7fa3] hover:underline font-medium">
                Xem chi tiết <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="h-36 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center text-sm text-[#6B7280]">
              Dữ liệu biểu đồ sẽ hiển thị ở đây
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-sm">
            <div className="mb-4">
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-0.5">Phân bổ</p>
              <h3 className="font-semibold text-[#111827] text-sm">Theo kênh tiếp nhận</h3>
            </div>
            <div className="h-36 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center text-sm text-[#6B7280]">
              Biểu đồ tròn
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


