import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, User, Phone, MapPin, Mail, Tag, FileText, Zap,
  AlertCircle, GitCommitVertical, ArrowRightLeft, Loader2, X,
  Store, CheckCircle2, AlertTriangle, Clock, Building2,
} from 'lucide-react';
import {
  useDispatchLeadDetail,
  useStoresCapacity,
  useAssignLead,
} from '@/features/dp/hooks/useDispatch';
import type {
  DispatchActivityLogDto, DispatchActivityAction, StoreCapacityDto,
} from '@/types/dispatch';
import { DISPATCH_ACTIVITY_LABELS, DISPATCH_LEAD_STATUS_LABELS } from '@/types/dispatch';
import { NEED_TYPE_LABELS } from '@/types/leads';
import styles from './DispatchLeadDetailPage.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function actionIconClass(action: DispatchActivityAction) {
  switch (action) {
    case 'LEAD_CREATED': return styles.actionCreated;
    case 'STATUS_CHANGED': return styles.actionStatus;
    case 'DISPATCHED_TO_STORE': return styles.actionDispatched;
  }
}

function ActionIcon({ action }: { action: DispatchActivityAction }) {
  switch (action) {
    case 'LEAD_CREATED': return <GitCommitVertical size={14} />;
    case 'STATUS_CHANGED': return <ArrowRightLeft size={14} />;
    case 'DISPATCHED_TO_STORE': return <Store size={14} />;
  }
}

// ─── Store Capacity Card ──────────────────────────────────────────────────────

function StoreCard({
  store,
  selected,
  onSelect,
}: {
  store: StoreCapacityDto;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const capacityPct = store.maxCapacity > 0
    ? Math.round((store.activeLeads / store.maxCapacity) * 100)
    : 0;

  return (
    <button
      className={`${styles.storeCard} ${selected ? styles.storeCardSelected : ''}`}
      onClick={() => onSelect(store.id)}
      type="button"
      id={`store-card-${store.id}`}
    >
      <div className={styles.storeCardHeader}>
        <div>
          <div className={styles.storeName}>{store.storeName}</div>
          <div className={styles.storeCode}>{store.storeCode} · {store.region}</div>
        </div>
        {store.isOverCapacity ? (
          <span className={`${styles.capacityBadge} ${styles.capacityFull}`}>Đầy tải</span>
        ) : store.isNearCapacity ? (
          <span className={`${styles.capacityBadge} ${styles.capacityNear}`}>Gần đầy</span>
        ) : (
          <span className={`${styles.capacityBadge} ${styles.capacityOk}`}>Còn chỗ</span>
        )}
      </div>
      <div className={styles.storeCapacityRow}>
        <div className={styles.capacityBar}>
          <div
            className={`${styles.capacityFill} ${
              store.isOverCapacity ? styles.fillFull :
              store.isNearCapacity ? styles.fillNear :
              styles.fillOk
            }`}
            style={{ width: `${Math.min(capacityPct, 100)}%` }}
          />
        </div>
        <span className={styles.capacityText}>
          {store.activeLeads}/{store.maxCapacity} lead ({store.availableSlots} slot trống)
        </span>
      </div>
      <div className={styles.storeAddress}>
        <MapPin size={10} /> {store.address}
      </div>
      {selected && (
        <div className={styles.storeSelectedMark}>
          <CheckCircle2 size={14} /> Đã chọn
        </div>
      )}
    </button>
  );
}

// ─── Assign Dialog — DP-04 + DP-05 ───────────────────────────────────────────

function AssignDialog({
  leadId,
  store,
  onClose,
  onSuccess,
}: {
  leadId: string;
  store: StoreCapacityDto;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const assignLead = useAssignLead();
  const [note, setNote] = useState('');
  const [confirmedOverCapacity, setConfirmedOverCapacity] = useState(false);
  const [error, setError] = useState('');
  const MAX_NOTE = 500;

  // BR-07: show warning for over-capacity store, require explicit confirm
  const needsOverCapacityConfirm = store.isOverCapacity && !confirmedOverCapacity;

  const handleSubmit = async () => {
    setError('');
    if (needsOverCapacityConfirm) {
      setError('Vui lòng xác nhận gán về cửa hàng đang đầy tải.');
      return;
    }
    try {
      await assignLead.mutateAsync({
        id: leadId,
        data: { storeId: store.id, note: note.trim() || undefined },
      });
      onSuccess();
    } catch {
      setError('Gán lead thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>
            <Store size={16} /> Xác nhận phân công
          </h2>
          <button className={styles.dialogClose} onClick={onClose}><X size={15} /></button>
        </div>
        <div className={styles.dialogBody}>
          {/* Store info summary */}
          <div className={styles.dialogStoreInfo}>
            <Building2 size={14} className={styles.dialogStoreIcon} />
            <div>
              <div className={styles.dialogStoreName}>{store.storeName}</div>
              <div className={styles.dialogStoreDetail}>
                {store.region} · {store.availableSlots} slot trống / {store.maxCapacity} tổng
              </div>
            </div>
            {store.isOverCapacity ? (
              <span className={`${styles.capacityBadge} ${styles.capacityFull}`}>Đầy tải</span>
            ) : store.isNearCapacity ? (
              <span className={`${styles.capacityBadge} ${styles.capacityNear}`}>Gần đầy</span>
            ) : (
              <span className={`${styles.capacityBadge} ${styles.capacityOk}`}>Còn chỗ</span>
            )}
          </div>

          {/* BR-07 over-capacity warning */}
          {store.isOverCapacity && (
            <div className={styles.warningBanner}>
              <AlertTriangle size={14} className={styles.warningIcon} />
              <div>
                <div className={styles.warningTitle}>Cửa hàng đang đầy tải!</div>
                <div className={styles.warningText}>
                  Cửa hàng hiện đã vượt quá {store.maxCapacity} lead. Bạn vẫn có thể gán nhưng sẽ ảnh hưởng đến chất lượng xử lý.
                </div>
              </div>
              {!confirmedOverCapacity && (
                <button
                  id="btn-confirm-over-capacity"
                  className={styles.btnConfirmWarning}
                  onClick={() => { setConfirmedOverCapacity(true); setError(''); }}
                >
                  Tôi hiểu, tiếp tục
                </button>
              )}
              {confirmedOverCapacity && (
                <span className={styles.warningConfirmed}><CheckCircle2 size={13} /> Đã xác nhận</span>
              )}
            </div>
          )}

          {/* Note — DP-05 */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Ghi chú lý do chọn cửa hàng
              <span className={styles.charCount}>{note.length}/{MAX_NOTE}</span>
            </label>
            <textarea
              id="assign-note"
              className={styles.formTextarea}
              placeholder="Cửa hàng gần nhất với địa chỉ khách, còn 2 slot trống..."
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, MAX_NOTE))}
              rows={3}
            />
          </div>

          {error && <p className={styles.fieldError}><AlertCircle size={12} /> {error}</p>}
        </div>
        <div className={styles.dialogFooter}>
          <button className={styles.btnSecondary} onClick={onClose} disabled={assignLead.isPending}>Huỷ</button>
          <button
            id="btn-confirm-assign"
            className={styles.btnPrimary}
            onClick={handleSubmit}
            disabled={assignLead.isPending || needsOverCapacityConfirm}
          >
            {assignLead.isPending && <Loader2 size={13} className={styles.spinning} />}
            Xác nhận gán
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Timeline Item ────────────────────────────────────────────────────────────

function TimelineItem({ log }: { log: DispatchActivityLogDto }) {
  return (
    <div className={styles.timelineItem}>
      <div className={`${styles.timelineIconWrap} ${actionIconClass(log.action)}`}>
        <ActionIcon action={log.action} />
      </div>
      <div className={styles.timelineContent}>
        <div className={styles.timelineMeta}>
          <span className={styles.timelineActor}>{log.performedByName ?? 'Hệ thống'}</span>
          <span className={styles.timelineAction}>{DISPATCH_ACTIVITY_LABELS[log.action]}</span>
          <span className={styles.timelineTime}>{fmtDate(log.performedAt)}</span>
        </div>
        {log.newValue && (
          <p className={styles.timelineNewStatus}>
            → {DISPATCH_LEAD_STATUS_LABELS[log.newValue as keyof typeof DISPATCH_LEAD_STATUS_LABELS] ?? log.newValue}
          </p>
        )}
        {log.note && <p className={styles.timelineNote}>{log.note}</p>}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function DispatchLeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: lead, isLoading, isError } = useDispatchLeadDetail(id!);
  const { data: stores, isLoading: storesLoading } = useStoresCapacity();

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const activeStores = (stores ?? []).filter((s) => s.isActive);
  const selectedStore = activeStores.find((s) => s.id === selectedStoreId) ?? null;

  const sortedStores = [...activeStores].sort((a, b) => {
    // Sort: available → near capacity → over capacity
    if (a.isOverCapacity !== b.isOverCapacity) return a.isOverCapacity ? 1 : -1;
    if (a.isNearCapacity !== b.isNearCapacity) return a.isNearCapacity ? 1 : -1;
    return b.availableSlots - a.availableSlots;
  });

  const sortedLogs = lead
    ? [...(lead.activityLogs ?? [])].sort(
        (a, b) => new Date(a.performedAt).getTime() - new Date(b.performedAt).getTime()
      )
    : [];


  if (isLoading) {
    return (
      <div className={styles.pageLoading}>
        <div className={styles.pageSpinner} />
      </div>
    );
  }

  if (isError || !lead) {
    return (
      <div className={styles.notFound}>
        <AlertCircle size={40} className={styles.notFoundIcon} />
        <p>Lead không tồn tại hoặc không ở trạng thái chờ điều phối.</p>
        <button className={styles.btnSecondary} onClick={() => navigate('/dp/queue')}>
          <ArrowLeft size={14} /> Quay lại hàng đợi
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate('/dp/queue')}>
            <ArrowLeft size={16} />
          </button>
          <div className={styles.titleGroup}>
            <span className={styles.leadCode}>{lead.leadCode}</span>
            <h1 className={styles.title}>{lead.customerName}</h1>
          </div>
          <div className={styles.waitBadge}>
            <Clock size={12} />
            {lead.waitedMinutes >= 60 ? (
              <span className={styles.waitLong}>Chờ {lead.waitedMinutes} phút ⚠</span>
            ) : (
              <span>Chờ {lead.waitedMinutes} phút</span>
            )}
          </div>
          {(() => {
            const lvl = lead.priorityLevel;
            const cls = lvl === 'High' ? styles.priorityHigh : lvl === 'Medium' ? styles.priorityMedium : styles.priorityLow;
            return <span className={`${styles.priorityBadge} ${cls}`}>{lvl}</span>;
          })()}
        </div>
        <div className={styles.headerActions}>
          <button
            id="btn-assign"
            className={styles.btnPrimary}
            disabled={!selectedStore}
            onClick={() => setAssignDialogOpen(true)}
          >
            <Store size={14} />
            {selectedStore ? `Gán về ${selectedStore.storeName}` : 'Chọn cửa hàng để gán'}
          </button>
        </div>
      </div>

      {/* 2-col grid */}
      <div className={styles.grid}>
        {/* Left col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Customer info */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}><User size={15} className={styles.cardTitleIcon} /> Thông tin khách hàng</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}><Phone size={10} /> Số điện thoại</span>
                  <span className={styles.fieldValue}>{lead.customerPhone}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}><Tag size={10} /> Kênh</span>
                  <span className={styles.fieldValue}>{lead.channel}</span>
                </div>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}><MapPin size={10} /> Địa chỉ</span>
                <span className={lead.customerAddress ? styles.fieldValue : styles.fieldValueMuted}>
                  {lead.customerAddress || 'Chưa có'}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}><Mail size={10} /> Email</span>
                <span className={lead.customerEmail ? styles.fieldValue : styles.fieldValueMuted}>
                  {lead.customerEmail ?? 'Chưa có'}
                </span>
              </div>
              {(lead.productInterest ?? []).length > 0 && (
                <div className={styles.field}>
                  <span className={styles.fieldLabel}><Tag size={10} /> Sản phẩm quan tâm</span>
                  <div className={styles.tagsWrap}>
                    {(lead.productInterest ?? []).map((t) => <span key={t} className={styles.tag}>{t}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Need description */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}><FileText size={15} className={styles.cardTitleIcon} /> Mô tả nhu cầu</h2>
            </div>
            <div className={styles.cardBody}>
              <p className={styles.fieldValue} style={{ margin: 0, lineHeight: 1.7 }}>{lead.needDescription}</p>
            </div>
          </div>

          {/* Classification */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}><Zap size={15} className={styles.cardTitleIcon} /> Kết quả phân loại</h2>
            </div>
            <div>
              <div className={styles.classRow}>
                <span className={styles.classLabel}>Loại nhu cầu</span>
                {lead.needType
                  ? <span className={styles.classValue}>{NEED_TYPE_LABELS[lead.needType]}</span>
                  : <span className={styles.classValueMuted}>—</span>
                }
              </div>
              <div className={styles.classRow}>
                <span className={styles.classLabel}>Điểm ưu tiên</span>
                <span className={styles.classValue}>{lead.priorityScore}</span>
              </div>
              <div className={styles.classRow}>
                <span className={styles.classLabel}>Nhóm xử lý</span>
                <span className={styles.classValue}>{lead.assignedGroup}</span>
              </div>
              <div className={styles.classRow}>
                <span className={styles.classLabel}>Ngày tạo</span>
                <span className={styles.classValue}>{fmtDate(lead.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Store capacity — DP-03 inline */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}><Building2 size={15} className={styles.cardTitleIcon} /> Chọn cửa hàng phân công</h2>
              <span className={styles.cardHint}>Click để chọn</span>
            </div>
            {storesLoading ? (
              <div className={styles.cardLoading}><div className={styles.miniSpinner} /></div>
            ) : sortedStores.length === 0 ? (
              <div className={styles.cardEmpty}>Không có cửa hàng khả dụng.</div>
            ) : (
              <div className={styles.storeList}>
                {sortedStores.map((store) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    selected={selectedStoreId === store.id}
                    onSelect={(sid) => setSelectedStoreId((prev) => prev === sid ? null : sid)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}><GitCommitVertical size={15} className={styles.cardTitleIcon} /> Lịch sử hoạt động</h2>
            </div>
            {sortedLogs.length === 0 ? (
              <div className={styles.cardEmpty}>Chưa có hoạt động.</div>
            ) : (
              <div className={styles.timeline}>
                {sortedLogs.map((log) => <TimelineItem key={log.id} log={log} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {assignDialogOpen && selectedStore && (
        <AssignDialog
          leadId={lead.leadId}
          store={selectedStore}
          onClose={() => setAssignDialogOpen(false)}
          onSuccess={() => {
            setAssignDialogOpen(false);
            navigate('/dp/queue');
          }}
        />
      )}
    </div>
  );
}
