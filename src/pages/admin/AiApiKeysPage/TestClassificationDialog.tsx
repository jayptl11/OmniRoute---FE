import { useState } from 'react';
import { X, Loader2, FlaskConical } from 'lucide-react';
import { useTestClassification } from '@/features/qt/hooks/useAiApiKeys';
import { Channel } from '@/types/admin';
import type {
  AiApiKeyDto,
  TestClassificationResponse,
  NeedType,
  AssignedGroupString,
} from '@/types/admin';
import styles from './AiApiKeysPage.module.css';
import { GlassButton } from '@/components/glass';

interface Props {
  keyItem: AiApiKeyDto;
  onClose: () => void;
}

const channelOptions: { value: Channel; label: string }[] = [
  { value: Channel.Hotline, label: 'Điện thoại' },
  { value: Channel.Walkin, label: 'Đến trực tiếp' },
  { value: Channel.Webform, label: 'Form website' },
  { value: Channel.Chat, label: 'Chat' },
  { value: Channel.Email, label: 'Email' },
  { value: Channel.Zalo, label: 'Zalo' },
  { value: Channel.Referral, label: 'Giới thiệu' },
];

const needTypeLabels: Record<NeedType, string> = {
  SaleNew: 'Mua hàng mới',
  SaleUpgrade: 'Nâng cấp',
  SaleRenew: 'Gia hạn',
  CskhSupport: 'Hỗ trợ',
  CskhComplaint: 'Khiếu nại',
  CskhWarranty: 'Bảo hành',
  StoreVisit: 'Đến cửa hàng',
  Other: 'Khác',
};

const needTypeBadgeClass: Record<NeedType, string> = {
  SaleNew: styles.needTypeSaleNew,
  SaleUpgrade: styles.needTypeSaleUpgrade,
  SaleRenew: styles.needTypeSaleRenew,
  CskhSupport: styles.needTypeCskhSupport,
  CskhComplaint: styles.needTypeCskhComplaint,
  CskhWarranty: styles.needTypeCskhWarranty,
  StoreVisit: styles.needTypeStoreVisit,
  Other: styles.needTypeOther,
};

const groupLabels: Record<AssignedGroupString, string> = {
  Sale: 'Kinh doanh',
  Cskh: 'Chăm sóc khách hàng',
  StoreSupport: 'Hỗ trợ cửa hàng',
};

const groupBadgeClass: Record<AssignedGroupString, string> = {
  Sale: styles.groupSale,
  Cskh: styles.groupCskh,
  StoreSupport: styles.groupStoreSupport,
};

function getConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 0.8) return 'high';
  if (score >= 0.5) return 'medium';
  return 'low';
}

function getConfidenceLabel(level: 'high' | 'medium' | 'low'): string {
  if (level === 'high') return 'Cao';
  if (level === 'medium') return 'Trung bình';
  return 'Thấp';
}

export function TestClassificationDialog({ keyItem, onClose }: Props) {
  const [channel, setChannel] = useState<Channel>(Channel.Hotline);
  const [needDescription, setNeedDescription] = useState('');
  const [result, setResult] = useState<TestClassificationResponse | null>(null);

  const testClassification = useTestClassification();

  const handleRunTest = async () => {
    if (!needDescription.trim()) return;

    setResult(null);
    try {
      const res = await testClassification.mutateAsync({
        id: keyItem.id,
        data: { needDescription, channel },
      });
      setResult(res);
    } catch {
      // Error handled by result display
    }
  };

  const confidenceLevel = result?.success
    ? getConfidenceLevel(result.confidenceScore)
    : null;

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog} role="dialog" aria-modal="true" style={{ maxWidth: 520 }}>
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>Test Lead Classification</h2>
          <GlassButton className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <X size={16} />
          </GlassButton>
        </div>

        <div className={styles.dialogBody}>
          {/* Key info */}
          <div className={styles.formGroup}>
            <label className={styles.label}>API Key</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={styles.cellMuted}>{keyItem.maskedKey}</span>
              <span className={`${styles.providerChip} ${
                keyItem.provider === 'OpenAI'
                  ? styles.providerOpenAI
                  : keyItem.provider === 'Gemini'
                  ? styles.providerGemini
                  : keyItem.provider === 'Anthropic'
                  ? styles.providerAnthropic
                  : styles.providerGroq
              }`}>
                {keyItem.provider}
              </span>
            </div>
          </div>

          {/* Channel dropdown */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="tc-channel">Channel *</label>
            <select
              id="tc-channel"
              className={styles.input}
              value={channel}
              onChange={(e) => setChannel(e.target.value as Channel)}
            >
              {channelOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Need description textarea */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="tc-description">
              Mô tả nhu cầu khách hàng *
            </label>
            <textarea
              id="tc-description"
              className={styles.textarea}
              value={needDescription}
              onChange={(e) => setNeedDescription(e.target.value)}
              placeholder="Nhập mô tả nhu cầu khách hàng..."
              rows={3}
            />
          </div>

          {/* Run test button */}
          <GlassButton
            className={styles.btnPrimary}
            onClick={handleRunTest}
            disabled={!needDescription.trim() || testClassification.isPending}
            style={{ width: '100%' }}
          >
            {testClassification.isPending ? (
              <>
                <Loader2 size={14} className={styles.spinning} />
                Đang phân loại...
              </>
            ) : (
              <>
                <FlaskConical size={14} />
                Run Test
              </>
            )}
          </GlassButton>

          {/* Result */}
          {testClassification.isError && (
            <div className={styles.errorCard}>
              <div className={styles.errorTitle}>
                <X size={14} />
                Lỗi kết nối
              </div>
              <div className={styles.errorDetail}>
                Không thể kết nối đến server. Vui lòng thử lại.
              </div>
            </div>
          )}

          {result && !result.success && (
            <div className={styles.errorCard}>
              <div className={styles.errorTitle}>
                <X size={14} />
                AI call thất bại
              </div>
              <div className={styles.errorDetail}>{result.errorMessage}</div>
              <div className={styles.errorDetail}>
                Provider: {result.provider} | Latency: {result.latencyMs}ms
              </div>
            </div>
          )}

          {result && result.success && (
            <div className={styles.resultCard}>
              {/* NeedType */}
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>NeedType</span>
                <span className={`${styles.needTypeBadge} ${needTypeBadgeClass[result.needType!]}`}>
                  {needTypeLabels[result.needType!]}
                </span>
              </div>

              {/* Confidence */}
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Confidence</span>
                <div className={styles.confidenceRow}>
                  <div className={styles.confidenceBar}>
                    <div
                      className={`${styles.confidenceFill} ${
                        confidenceLevel === 'high'
                          ? styles.confidenceHigh
                          : confidenceLevel === 'medium'
                          ? styles.confidenceMedium
                          : styles.confidenceLow
                      }`}
                      style={{ width: `${result.confidenceScore * 100}%` }}
                    />
                  </div>
                  <span className={styles.resultValue}>
                    {Math.round(result.confidenceScore * 100)}%
                  </span>
                  <span
                    className={`${styles.confidenceBadge} ${
                      confidenceLevel === 'high'
                        ? styles.confidenceBadgeHigh
                        : confidenceLevel === 'medium'
                        ? styles.confidenceBadgeMedium
                        : styles.confidenceBadgeLow
                    }`}
                  >
                    {getConfidenceLabel(confidenceLevel!)}
                  </span>
                </div>
              </div>

              {/* AssignedGroup */}
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>AssignedGroup</span>
                <span className={`${styles.groupBadge} ${groupBadgeClass[result.assignedGroup!]}`}>
                  {groupLabels[result.assignedGroup!]}
                </span>
              </div>

              {/* Reasoning */}
              <div className={styles.resultRow} style={{ alignItems: 'flex-start' }}>
                <span className={styles.resultLabel}>Reasoning</span>
                <div className={styles.reasoningText}>{result.reasoning}</div>
              </div>

              {/* Latency & Provider */}
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Latency</span>
                <span className={styles.latencyText}>{result.latencyMs}ms</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Provider</span>
                <span className={styles.providerText}>{result.provider}</span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.dialogFooter}>
          <GlassButton className={styles.btnSecondary} onClick={onClose}>
            Đóng
          </GlassButton>
        </div>
      </div>
    </div>
  );
}
