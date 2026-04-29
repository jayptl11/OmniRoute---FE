import { useStoreCapacity, useStoreWorkload } from '@/features/ql/hooks/useStoreManager';
import type { StoreStaffWorkloadDto } from '@/types/storemanager';
import styles from './QlDashboardPage.module.css';

// ── Capacity Widget ────────────────────────────────────────────────────────────

function CapacityWidget() {
  const { data, isLoading, isError } = useStoreCapacity();

  if (isLoading) {
    return <div className={styles.card}><p className={styles.loadingText}>Đang tải...</p></div>;
  }

  if (isError || !data) {
    return (
      <div className={styles.card}>
        <p className={styles.errorText}>Không thể tải thông tin năng lực đơn vị.</p>
      </div>
    );
  }

  const pct = Math.min((data.activeLeads / data.maxCapacity) * 100, 100);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.storeName}>{data.storeName}</h2>
          <p className={styles.storeMeta}>
            {[data.storeCode, data.region, data.address].filter(Boolean).join(' · ')}
          </p>
        </div>
        {data.isOverCapacity && (
          <span className={`${styles.capacityBadge} ${styles.badgeRed}`}>Quá tải</span>
        )}
        {!data.isOverCapacity && data.isNearCapacity && (
          <span className={`${styles.capacityBadge} ${styles.badgeYellow}`}>Gần đầy</span>
        )}
      </div>

      {data.isOverCapacity && (
        <div className={`${styles.banner} ${styles.bannerRed}`}>
          ⚠️ Đơn vị đang quá tải — {data.activeLeads}/{data.maxCapacity} lead active.
        </div>
      )}
      {!data.isOverCapacity && data.isNearCapacity && (
        <div className={`${styles.banner} ${styles.bannerYellow}`}>
          ⚡ Đơn vị gần đầy — còn {data.availableSlots} slot trống.
        </div>
      )}

      <div className={styles.progressSection}>
        <div className={styles.progressMeta}>
          <span>{data.activeLeads} lead đang active</span>
          <span>Tối đa: {data.maxCapacity}</span>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={`${styles.progressBar} ${
              data.isOverCapacity
                ? styles.progressRed
                : data.isNearCapacity
                ? styles.progressYellow
                : styles.progressGreen
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className={styles.progressPct}>{pct.toFixed(1)}%</div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <span className={styles.statValue}>{data.activeLeads}</span>
          <span className={styles.statLabel}>Active leads</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statValue}>{data.availableSlots}</span>
          <span className={styles.statLabel}>Slot trống</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statValue}>{data.maxCapacity}</span>
          <span className={styles.statLabel}>Tối đa</span>
        </div>
      </div>
    </div>
  );
}

// ── Workload Table ─────────────────────────────────────────────────────────────

function roleLabel(role: string | null): string {
  if (!role) return '—';
  const map: Record<string, string> = { SA: 'Tư vấn', CS: 'CSKH', DP: 'Dispatch' };
  return map[role] ?? role;
}

function WorkloadTable() {
  const { data, isLoading, isError } = useStoreWorkload();

  if (isLoading) {
    return (
      <div className={styles.card}>
        <p className={styles.loadingText}>Đang tải workload nhân sự...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className={styles.card}>
        <p className={styles.errorText}>Không thể tải workload nhân sự.</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.sectionTitle}>Workload nhân sự</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nhân sự</th>
              <th>Vai trò</th>
              <th>Lead active</th>
              <th>Vi phạm SLA</th>
              <th>Đã hoàn thành</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.emptyCell}>Chưa có nhân sự nào.</td>
              </tr>
            )}
            {data.map((m: StoreStaffWorkloadDto) => (
              <tr key={m.userId} className={m.isActive ? '' : styles.rowInactive}>
                <td className={styles.nameCell}>{m.fullName}</td>
                <td>{roleLabel(m.roleName)}</td>
                <td>
                  <span className={styles.workloadBadge}>{m.currentWorkload}</span>
                </td>
                <td>
                  {m.slaViolatedCount > 0 ? (
                    <span className={styles.slaViolatedBadge}>{m.slaViolatedCount}</span>
                  ) : (
                    <span className={styles.slaNoneBadge}>{m.slaViolatedCount}</span>
                  )}
                </td>
                <td>{m.completedCount}</td>
                <td>
                  {m.isActive ? (
                    <span className={styles.activeTag}>Hoạt động</span>
                  ) : (
                    <span className={styles.inactiveTag}>Đã khóa</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function QlDashboardPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Tổng quan đơn vị</h1>
        <p className={styles.pageDesc}>Năng lực tiếp nhận và workload nhân sự hiện tại</p>
      </div>
      <div className={styles.grid}>
        <CapacityWidget />
        <WorkloadTable />
      </div>
    </div>
  );
}
