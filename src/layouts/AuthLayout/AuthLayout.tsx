import { Outlet } from 'react-router-dom';
import { GitBranch, Globe } from 'lucide-react';
import styles from './AuthLayout.module.css';

export function AuthLayout() {
  return (
    <div className={styles.shell}>
      {/* Centered Floating Glass Card */}
      <div className={styles.container}>
        
        {/* ── Left panel: Form area ───────────────────────────── */}
        <main className={styles.mainCol}>
          <div className={styles.formWrap}>
            <Outlet />
          </div>
        </main>

        {/* ── Right panel: dynamic brand column ─────────────────────────── */}
        <aside className={styles.asideCol}>
          <div>
            {/* Logo */}
            <div className={styles.logoArea}>
              <img src="/viettel-commerce.png" alt="Viettel Commerce" className={styles.viettelCommerceLogo} />
            </div>

            {/* Eyebrow + heading */}
            <p className={styles.eyebrow}>
              Hệ thống Thông minh
            </p>
            <h2 className={styles.heading}>
              Phân luồng Khách hàng <br />
              <span className={styles.headingHighlight}>Đa kênh</span> Tự động
            </h2>

            {/* Bento feature grid */}
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <GitBranch size={18} strokeWidth={2.5} />
                </div>
                <p className={styles.featureTitle}>Định tuyến thông minh</p>
                <p className={styles.featureDesc}>Phân luồng tự động theo quy tắc nghiệp vụ giúp tối ưu nguồn lực và tăng tốc độ xử lý.</p>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <Globe size={18} strokeWidth={2.5} />
                </div>
                <p className={styles.featureTitle}>Đa kênh tích hợp</p>
                <p className={styles.featureDesc}>Hợp nhất mọi điểm tiếp xúc khách hàng từ Zalo, Facebook, Hotline vào một nơi duy nhất.</p>
              </div>
            </div>
          </div>

          {/* Footer — Viettel badge */}
          <div className={styles.footer}>
            <img src="/viettel-logo.jpg" alt="Viettel Logo" className={styles.viettelLogo} />
            <div className={styles.footerText}>
              <span className={styles.footerTitle}>Viettel Commerce</span>
              <span className={styles.footerSubtitle}>Thương mại & Xuất nhập khẩu</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
