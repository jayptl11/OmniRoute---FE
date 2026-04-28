import { useState } from 'react';
import {
  useRoutingRules,
  useToggleRuleStatus,
  useTestRule,
} from '@/features/admin/hooks/useRoutingRules';
import { RuleFormDialog } from './RuleFormDialog';
import type { RoutingRuleDto } from '@/types/admin';
import { Plus, Pencil, Power, RefreshCw, SendHorizonal, FlaskConical } from 'lucide-react';
import styles from '../UsersPage/UsersPage.module.css';
import ruleStyles from './RoutingRulesPage.module.css';

export function RoutingRulesPage() {
  const { data: rules = [], isLoading, refetch, isFetching } = useRoutingRules();
  const toggleStatus = useToggleRuleStatus();
  const testRule = useTestRule();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<RoutingRuleDto | null>(null);

  // Test panel state
  const [testDesc, setTestDesc] = useState('');
  const [testChannel, setTestChannel] = useState('');
  const [confirmToggle, setConfirmToggle] = useState<RoutingRuleDto | null>(null);

  const handleToggle = (rule: RoutingRuleDto) => {
    if (rule.isActive) {
      setConfirmToggle(rule);
    } else {
      toggleStatus.mutate({ id: rule.id, isActive: true });
    }
  };

  const handleTest = (e: React.FormEvent) => {
    e.preventDefault();
    testRule.mutate({ needDescription: testDesc || null, channel: testChannel || null });
  };

  const sortedRules = [...rules].sort((a, b) => a.priorityOrder - b.priorityOrder);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Routing Rules</h1>
          <p className={styles.subtitle}>Cấu hình quy tắc phân luồng tự động theo kênh và từ khóa</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => { setEditTarget(null); setFormOpen(true); }}>
          <Plus size={15} />
          Thêm rule
        </button>
      </div>

      {/* Filters row */}
      <div className={styles.filters}>
        <button className={styles.btnIcon} onClick={() => refetch()} title="Làm mới">
          <RefreshCw size={14} className={isFetching ? styles.spinning : ''} />
        </button>
        <span className={styles.paginationInfo}>{rules.length} rule · {rules.filter(r => r.isActive).length} đang bật</span>
      </div>

      {/* Rules Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 52 }}>Thứ tự</th>
              <th>Tên rule</th>
              <th>Kênh áp dụng</th>
              <th>Từ khóa</th>
              <th>Nhóm xử lý</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className={styles.emptyCell}><div className={styles.loadingSpinner} /></td></tr>
            ) : sortedRules.length === 0 ? (
              <tr><td colSpan={7} className={styles.emptyCell}>Chưa có rule nào. Tạo rule đầu tiên!</td></tr>
            ) : (
              sortedRules.map((rule) => (
                <tr key={rule.id}>
                  <td>
                    <span className={ruleStyles.priorityBadge}>#{rule.priorityOrder}</span>
                  </td>
                  <td>
                    <p className={styles.cellBold}>{rule.ruleName}</p>
                    {rule.description && <p className={styles.cellMuted}>{rule.description}</p>}
                  </td>
                  <td>
                    {rule.conditionChannels == null ? (
                      <span className={ruleStyles.tagAll}>Tất cả kênh</span>
                    ) : (
                      <div className={ruleStyles.tagRow}>
                        {rule.conditionChannels.map((c) => (
                          <span key={c} className={ruleStyles.tag}>{c}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    {rule.conditionKeywords == null ? (
                      <span className={styles.cellMuted}>—</span>
                    ) : (
                      <div className={ruleStyles.tagRow}>
                        {rule.conditionKeywords.map((k) => (
                          <span key={k} className={ruleStyles.tagKeyword}>{k}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={ruleStyles.groupBadge}>{rule.actionGroup}</span>
                    {rule.actionTeamName && (
                      <p className={styles.cellMuted}>{rule.actionTeamName}</p>
                    )}
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${rule.isActive ? styles.statusActive : styles.statusInactive}`}>
                      {rule.isActive ? 'Đang bật' : 'Đã tắt'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} title="Chỉnh sửa" onClick={() => { setEditTarget(rule); setFormOpen(true); }}>
                        <Pencil size={13} />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${rule.isActive ? styles.actionDanger : styles.actionSuccess}`}
                        title={rule.isActive ? 'Tắt rule' : 'Bật rule'}
                        onClick={() => handleToggle(rule)}
                        disabled={toggleStatus.isPending}
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
      </div>

      {/* Test Panel */}
      <div>
        <div className={styles.header} style={{ marginBottom: 12 }}>
          <div>
            <h2 className={styles.title} style={{ fontSize: '1rem' }}>
              <FlaskConical size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              Test Rule
            </h2>
            <p className={styles.subtitle}>Kiểm tra rule nào sẽ được áp dụng — không tạo lead thật</p>
          </div>
        </div>
        <div className={styles.testPanel}>
          <form onSubmit={handleTest} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              id="test-need-desc"
              className={styles.searchInput}
              style={{ flex: 2, minWidth: 200 }}
              placeholder="Mô tả nhu cầu thử nghiệm..."
              value={testDesc}
              onChange={(e) => setTestDesc(e.target.value)}
            />
            <select
              id="test-channel"
              className={styles.select}
              value={testChannel}
              onChange={(e) => setTestChannel(e.target.value)}
            >
              <option value="">Tất cả kênh</option>
              {['Hotline','Walkin','Webform','Chat','Email','Zalo','Referral'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button type="submit" className={styles.btnPrimary} disabled={testRule.isPending}>
              <SendHorizonal size={14} />
              {testRule.isPending ? 'Đang test...' : 'Test'}
            </button>
          </form>

          {testRule.data && (
            <div className={`${styles.testResult} ${testRule.data.matched ? styles.testResultMatch : styles.testResultNoMatch}`}>
              <p className={styles.testResultTitle}>
                {testRule.data.matched ? '✅ Khớp rule' : '⚠️ Không có rule nào khớp'}
              </p>
              <div className={styles.testResultDetail}>
                {testRule.data.matched ? (
                  <>
                    <p>Rule: <strong>{testRule.data.matchedRuleName}</strong> (Priority #{testRule.data.matchedPriorityOrder})</p>
                    <p>Kết quả: Chuyển đến nhóm <strong>{testRule.data.resultGroup}</strong></p>
                  </>
                ) : (
                  <p>Sẽ dùng nhóm mặc định: <strong>{testRule.data.resultGroup}</strong></p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm toggle dialog */}
      {confirmToggle && (
        <div className={styles.overlay}>
          <div className={styles.confirmDialog}>
            <div className={styles.confirmIcon}>⚠️</div>
            <h3 className={styles.confirmTitle}>Tắt rule phân luồng</h3>
            <p className={styles.confirmText}>
              Tắt rule <strong>"{confirmToggle.ruleName}"</strong> có thể thay đổi luồng phân loại lead. Bạn có chắc chắn muốn tiếp tục?
            </p>
            <div className={styles.confirmActions}>
              <button className={styles.btnSecondary} onClick={() => setConfirmToggle(null)}>Huỷ</button>
              <button className={styles.btnDanger} onClick={() => {
                toggleStatus.mutate({ id: confirmToggle.id, isActive: false });
                setConfirmToggle(null);
              }}>
                Tắt rule
              </button>
            </div>
          </div>
        </div>
      )}

      {formOpen && (
        <RuleFormDialog
          rule={editTarget}
          onClose={() => { setFormOpen(false); setEditTarget(null); }}
        />
      )}
    </div>
  );
}
