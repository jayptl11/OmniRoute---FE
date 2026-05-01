import { useState } from 'react';
import {
  Plus,
  RefreshCw,
  Pencil,
  FlaskConical,
  Power,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useAiApiKeys,
  useToggleAiApiKeyStatus,
  useTestAiApiKey,
} from '@/features/qt/hooks/useAiApiKeys';
import type { AiApiKeyDto } from '@/types/admin';
import { AddAiApiKeyDialog } from './AddAiApiKeyDialog';
import { EditAiApiKeyDialog } from './EditAiApiKeyDialog';
import styles from './AiApiKeysPage.module.css';

// ── helpers ───────────────────────────────────────────────────────────────────

function formatDatetime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ProviderChip({ provider }: { provider: AiApiKeyDto['provider'] }) {
  const cls =
    provider === 'OpenAI'
      ? styles.providerOpenAI
      : provider === 'Gemini'
      ? styles.providerGemini
      : provider === 'Anthropic'
      ? styles.providerAnthropic
      : styles.providerGroq;
  return <span className={`${styles.providerChip} ${cls}`}>{provider}</span>;
}

// ── main component ─────────────────────────────────────────────────────────────

export function AiApiKeysPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AiApiKeyDto | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const { data: keys = [], isLoading, isFetching, refetch } = useAiApiKeys();
  const toggleStatus = useToggleAiApiKeyStatus();
  const testKey = useTestAiApiKey();

  const handleToggle = (key: AiApiKeyDto) => {
    toggleStatus.mutate(key.id, {
      onError: () => toast.error('Không thể thay đổi trạng thái. Vui lòng thử lại.'),
    });
  };

  const handleTest = async (key: AiApiKeyDto) => {
    setTestingId(key.id);
    try {
      const result = await testKey.mutateAsync(key.id);
      if (result.success) {
        toast.success(`Key hợp lệ — phản hồi ${result.durationMs}ms`);
      } else {
        toast.error(`Lỗi: ${result.errorMessage ?? 'Không xác định'}`);
      }
    } catch {
      toast.error('Không thể kết nối đến server. Vui lòng thử lại.');
    } finally {
      setTestingId(null);
      refetch();
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>AI API Keys</h1>
          <p className={styles.subtitle}>
            Quản lý API keys của các nhà cung cấp AI dùng để phân loại NeedType
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={styles.btnSecondary}
            onClick={() => refetch()}
            aria-label="Làm mới"
          >
            <RefreshCw size={14} className={isFetching ? styles.spinning : undefined} />
          </button>
          <button className={styles.btnPrimary} onClick={() => setAddOpen(true)}>
            <Plus size={15} />
            Thêm key
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        {isLoading ? (
          <div className={styles.loadingSpinner} />
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Tên hiển thị</th>
                <th>Key</th>
                <th>Model</th>
                <th>Priority</th>
                <th>Trạng thái</th>
                <th>Lần lỗi</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {keys.length === 0 ? (
                <tr>
                  <td className={styles.emptyCell} colSpan={8}>
                    Chưa có API key nào được cấu hình
                  </td>
                </tr>
              ) : (
                keys.map((key) => (
                  <tr key={key.id}>
                    <td>
                      <ProviderChip provider={key.provider} />
                    </td>
                    <td className={styles.cellBold}>{key.displayName}</td>
                    <td className={styles.cellMuted}>{key.maskedKey}</td>
                    <td className={styles.cellMuted}>{key.config.model}</td>
                    <td>
                      <span
                        className={`${styles.priorityBadge} ${
                          key.priority === 1 ? styles.priorityPrimary : styles.priorityFallback
                        }`}
                      >
                        {key.priority === 1 ? 'Primary' : 'Fallback'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          key.isActive ? styles.statusActive : styles.statusInactive
                        }`}
                      >
                        {key.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {key.failureCount > 0 ? (
                        <span
                          className={`${styles.failureCount} ${styles.failureRed}`}
                          title={`Lần cuối lỗi: ${formatDatetime(key.lastFailedAt)}`}
                        >
                          {key.failureCount}
                        </span>
                      ) : (
                        <span className={`${styles.failureCount} ${styles.failureNone}`}>0</span>
                      )}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        {/* Test */}
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnTest}`}
                          onClick={() => handleTest(key)}
                          disabled={testingId === key.id}
                          title="Test key"
                        >
                          {testingId === key.id ? (
                            <Loader2 size={13} className={styles.spinning} />
                          ) : (
                            <FlaskConical size={13} />
                          )}
                          Test
                        </button>

                        {/* Edit */}
                        <button
                          className={styles.actionBtn}
                          onClick={() => setEditTarget(key)}
                          title="Sửa"
                        >
                          <Pencil size={13} />
                        </button>

                        {/* Toggle active */}
                        <button
                          className={`${styles.actionBtn} ${
                            key.isActive ? styles.actionBtnDanger : styles.actionBtnSuccess
                          }`}
                          onClick={() => handleToggle(key)}
                          disabled={toggleStatus.isPending && toggleStatus.variables === key.id}
                          title={key.isActive ? 'Tắt key' : 'Bật key'}
                        >
                          <Power size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {addOpen && <AddAiApiKeyDialog onClose={() => setAddOpen(false)} />}
      {editTarget && (
        <EditAiApiKeyDialog keyItem={editTarget} onClose={() => setEditTarget(null)} />
      )}
    </div>
  );
}
