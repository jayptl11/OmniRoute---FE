/**
 * AddressAutocomplete — address search input powered by OpenStreetMap / Nominatim
 * - Hoàn toàn miễn phí, không cần API key
 * - Nominatim là geocoding service chính thức của OpenStreetMap
 * - Debounce 500ms để tuân thủ usage policy (max 1 req/s)
 *
 * Export name giữ nguyên GooglePlacesInput để không phải sửa import ở 3 nơi.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './GooglePlacesInput.module.css';

// ── Nominatim result ──────────────────────────────────────────────────────────

interface NominatimResult {
  place_id: number;
  display_name: string;
  type: string;
  lat: string;
  lon: string;
}

// ── Nominatim search ─────────────────────────────────────────────────────────

async function searchNominatim(
  query: string,
  countryCode: string,
): Promise<NominatimResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '6',
    countrycodes: countryCode,
    'accept-language': 'vi',
    addressdetails: '0',
  });

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      headers: {
        // Nominatim yêu cầu User-Agent để nhận dạng ứng dụng
        'User-Agent': 'OmniRoute/1.0',
      },
    },
  );

  if (!res.ok) throw new Error('Nominatim error');
  return res.json();
}

// ── Component ────────────────────────────────────────────────────────────────

interface GooglePlacesInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  country?: string; // ISO alpha-2, default 'vn'
}

export function GooglePlacesInput({
  id,
  value,
  onChange,
  className,
  placeholder = 'Nhập địa chỉ...',
  country = 'vn',
}: GooglePlacesInputProps) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const doSearch = useCallback(
    async (q: string) => {
      if (q.trim().length < 3) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      setLoading(true);
      try {
        const results = await searchNominatim(q, country);
        setSuggestions(results);
        setOpen(results.length > 0);
        setActiveIdx(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [country],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    // Debounce 500ms
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 500);
  };

  const handleSelect = (result: NominatimResult) => {
    onChange(result.display_name);
    setSuggestions([]);
    setOpen(false);
    setActiveIdx(-1);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <input
        id={id}
        type="text"
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
      />

      {(loading || open) && (
        <div className={styles.dropdown} role="listbox">
          {loading && (
            <div className={styles.loadingRow}>
              <span className={styles.spinner} />
              Đang tìm kiếm...
            </div>
          )}
          {!loading && suggestions.map((s, i) => (
            <button
              key={s.place_id}
              role="option"
              aria-selected={i === activeIdx}
              className={`${styles.option} ${i === activeIdx ? styles.optionActive : ''}`}
              onMouseDown={(e) => e.preventDefault()} // không blur input
              onClick={() => handleSelect(s)}
            >
              <span className={styles.optionPin}>📍</span>
              <span className={styles.optionText}>{s.display_name}</span>
            </button>
          ))}
          {!loading && open && suggestions.length === 0 && (
            <div className={styles.noResult}>Không tìm thấy địa chỉ</div>
          )}
        </div>
      )}
    </div>
  );
}
