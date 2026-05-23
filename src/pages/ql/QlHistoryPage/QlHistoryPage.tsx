import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SearchableUserPicker, type SearchableUserPickerOption } from '@/components/SearchableUserPicker';
import { useSearchStoreLeadHistoryActors, useStoreLeadHistory } from '@/features/ql/hooks/useStoreManager';
import type { GetStoreHistoryParams, StoreLeadHistoryActorDto, StoreLeadHistoryItemDto } from '@/types/storemanager';
import styles from './QlHistoryPage.module.css';

function formatDatetime(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

type ActionMeta = { label: string; colorClass: string };

function getActionMeta(action: string, cssModule: Record<string, string>): ActionMeta {
  const map: Record<string, ActionMeta> = {
    LEAD_REASSIGNED: { label: 'Reassign lead', colorClass: cssModule.actionBlue },
    STATUS_CHANGED: { label: 'Thay đổi trạng thái', colorClass: cssModule.actionPurple },
    NOTE_ADDED: { label: 'Thêm ghi chú', colorClass: cssModule.actionGray },
    STORE_STAFF_ADDED: { label: 'Thêm nhân sự', colorClass: cssModule.actionGreen },
    STORE_STAFF_REMOVED: { label: 'Xóa nhân sự', colorClass: cssModule.actionRed },
  };

  return map[action] ?? { label: action, colorClass: cssModule.actionGray };
}

function toHistoryActorOption(
  actor: StoreLeadHistoryActorDto,
): SearchableUserPickerOption<StoreLeadHistoryActorDto> {
  return {
    value: actor.userId,
    label: actor.fullName,
    raw: actor,
  };
}

export function QlHistoryPage() {
  const [params, setParams] = useState<GetStoreHistoryParams>({ page: 1, pageSize: 20 });
  const [actorQuery, setActorQuery] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedActor, setSelectedActor] = useState<SearchableUserPickerOption<StoreLeadHistoryActorDto> | null>(null);

  const { data, isLoading, isError } = useStoreLeadHistory(params);
  const { data: actors = [], isFetching } = useSearchStoreLeadHistoryActors(actorQuery, pickerOpen);

  const items = data?.items ?? [];
  const total = data?.totalCount ?? 0;
  const totalPages = Math.ceil(total / (params.pageSize ?? 20));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Lịch sử xử lý lead</h1>
        <p className={styles.pageDesc}>Audit trail - toàn bộ hành động trên lead của đơn vị</p>
      </div>

      <div className={styles.filterBar}>
        <div style={{ minWidth: 240, flex: '1 1 240px' }}>
          <SearchableUserPicker
            mode="remote"
            compact
            placeholder="Tất cả nhân sự"
            options={actors.map(toHistoryActorOption)}
            selectedOption={selectedActor}
            onChange={(option) => {
              setSelectedActor(option);
              setParams((prev) => ({ ...prev, page: 1, userId: option?.value || undefined }));
            }}
            onSearch={setActorQuery}
            onOpenChange={setPickerOpen}
            isLoading={isFetching}
            fetchOnOpen
            emptyMessage="Không tìm thấy người thao tác phù hợp."
            className={styles.filterPicker}
          />
        </div>

        <input
          type="date"
          className={styles.filterDate}
          value={params.dateFrom?.slice(0, 10) ?? ''}
          onChange={(event) => setParams((prev) => ({ ...prev, page: 1, dateFrom: event.target.value || undefined }))}
        />
        <span className={styles.dateSep}>→</span>
        <input
          type="date"
          className={styles.filterDate}
          value={params.dateTo?.slice(0, 10) ?? ''}
          onChange={(event) => setParams((prev) => ({ ...prev, page: 1, dateTo: event.target.value || undefined }))}
        />
      </div>

      {isLoading && <div className={styles.loading}>Đang tải lịch sử...</div>}
      {isError && <div className={styles.errorMsg}>Không thể tải lịch sử.</div>}

      {!isLoading && !isError && (
        <>
          {items.length === 0 ? (
            <div className={styles.empty}>Không có dữ liệu lịch sử.</div>
          ) : (
            <div className={styles.timeline}>
              {items.map((item: StoreLeadHistoryItemDto, index: number) => {
                const meta = getActionMeta(item.action, styles);
                return (
                  <div key={item.logId} className={styles.timelineItem}>
                    <div className={styles.connector}>
                      <div className={`${styles.dot} ${meta.colorClass}`} />
                      {index < items.length - 1 && <div className={styles.line} />}
                    </div>

                    <div className={styles.timelineContent}>
                      <div className={styles.contentHeader}>
                        <span className={`${styles.actionBadge} ${meta.colorClass}`}>{meta.label}</span>
                        {item.leadCode && <span className={styles.leadCode}>{item.leadCode}</span>}
                        <span className={styles.timestamp}>{formatDatetime(item.performedAt)}</span>
                      </div>

                      {(item.customerName || item.customerPhone) && (
                        <p className={styles.customerLine}>
                          {[item.customerName, item.customerPhone].filter(Boolean).join(' · ')}
                        </p>
                      )}

                      {(item.oldValue || item.newValue) && (
                        <div className={styles.diffRow}>
                          {item.oldValue && <span className={styles.oldValue}>{item.oldValue}</span>}
                          {item.oldValue && item.newValue && <span className={styles.arrow}>→</span>}
                          {item.newValue && <span className={styles.newValue}>{item.newValue}</span>}
                        </div>
                      )}

                      {item.note && <p className={styles.noteText}>Ghi chú: {item.note}</p>}

                      <p className={styles.performedBy}>
                        Thực hiện bởi: <strong>{item.performedByName ?? '—'}</strong>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>
              {total} bản ghi · Trang {params.page}/{totalPages || 1}
            </span>
            <div className={styles.paginationBtns}>
              <button
                className={styles.pageBtn}
                disabled={(params.page ?? 1) <= 1}
                onClick={() => setParams((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
                type="button"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                className={styles.pageBtn}
                disabled={(params.page ?? 1) >= totalPages}
                onClick={() => setParams((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
                type="button"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
