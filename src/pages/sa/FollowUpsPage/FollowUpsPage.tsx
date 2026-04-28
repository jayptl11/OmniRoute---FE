import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Clock, AlertTriangle, CalendarCheck } from 'lucide-react';
import { useFollowUps } from '@/features/sa/hooks/useSaleLeads';
import type { FollowUpFilter } from '@/types/leads';
import styles from './FollowUpsPage.module.css';

type TabDef = { label: string; filter?: FollowUpFilter };

const TABS: TabDef[] = [
  { label: 'Tất cả' },
  { label: 'Hôm nay',   filter: 'today' },
  { label: 'Sắp đến',   filter: 'upcoming' },
  { label: 'Quá hạn',   filter: 'overdue' },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function FollowUpsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const filter = TABS[activeTab].filter;
  const { data: tasks = [], isLoading } = useFollowUps(filter);

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>Nhắc nhở follow-up</h1>
        <p className={styles.subtitle}>Các nhắc nhở chưa hoàn thành được gán cho bạn</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((tab, i) => (
          <button
            key={i}
            id={`followup-tab-${i}`}
            className={`${styles.tab} ${activeTab === i ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {tab.label}
            {tab.filter === 'overdue' && tasks.length > 0 && activeTab !== i && (
              <span style={{ marginLeft: 5, background: '#fee2e2', color: '#b91c1c', borderRadius: 10, padding: '0 6px', fontSize: '0.68rem', fontWeight: 700 }}>
                {tasks.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className={styles.loading}><div className={styles.spinner} /></div>
      ) : tasks.length === 0 ? (
        <div className={styles.emptyState}>
          <CalendarCheck size={40} className={styles.emptyIcon} />
          <p>Không có nhắc nhở nào</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {tasks.map((task) => (
            <div key={task.taskId} className={styles.card}>
              <div className={styles.cardTop}>
                <div>
                  <p className={styles.cardName}>{task.customerName}</p>
                  <p className={styles.cardPhone}>{task.customerPhone}</p>
                </div>
                <div className={styles.cardBadges}>
                  {task.isOverdue && (
                    <span className={styles.badgeOverdue}>
                      <AlertTriangle size={10} /> Quá hạn
                    </span>
                  )}
                  {task.isToday && !task.isOverdue && (
                    <span className={styles.badgeToday}>
                      <Bell size={10} /> Hôm nay
                    </span>
                  )}
                </div>
              </div>

              <Link to={`/sa/leads/${task.leadId}`} className={styles.cardLeadLink}>
                {task.leadCode}
              </Link>

              <div className={`${styles.cardDue} ${task.isOverdue ? styles.cardDueOverdue : ''}`}>
                <Clock size={13} />
                {fmtDate(task.dueAt)}
              </div>

              <div className={styles.cardNote}>{task.note}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
