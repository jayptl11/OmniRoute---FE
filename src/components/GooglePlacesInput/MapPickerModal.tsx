/**
 * MapPickerModal — Leaflet map picker
 * Click trên bản đồ → reverse geocode bằng Nominatim → fill địa chỉ
 * Render qua ReactDOM.createPortal để tránh z-index stacking context
 */

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './MapPickerModal.module.css';

// ── Fix Leaflet default marker icons trong Vite ──────────────────────────────
// Vite làm vỡ URL icon mặc định của Leaflet → dùng CDN
const DEFAULT_ICON = L.icon({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:    [25, 41],
  iconAnchor:  [12, 41],
  popupAnchor: [1, -34],
  shadowSize:  [41, 41],
});

// ── Nominatim helpers ────────────────────────────────────────────────────────

const HEADERS = { 'User-Agent': 'OmniRoute/1.0' };

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=vi`,
    { headers: HEADERS },
  );
  const data = await res.json();
  return (data.display_name as string) ?? `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
}

async function forwardGeocode(address: string): Promise<L.LatLngTuple | null> {
  const params = new URLSearchParams({
    q: address, format: 'json', limit: '1',
    countrycodes: 'vn', 'accept-language': 'vi',
  });
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    { headers: HEADERS },
  );
  const data = await res.json();
  if (data[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  return null;
}

// ── Component ────────────────────────────────────────────────────────────────

interface MapPickerModalProps {
  initialAddress?: string;
  onConfirm: (address: string) => void;
  onClose: () => void;
}

// Trung tâm Việt Nam
const VN_CENTER: L.LatLngTuple = [16.047, 108.206];

export function MapPickerModal({ initialAddress, onConfirm, onClose }: MapPickerModalProps) {
  const mapDivRef    = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const markerRef    = useRef<L.Marker | null>(null);

  const [selectedAddress, setSelectedAddress] = useState(initialAddress ?? '');
  const [geocoding, setGeocoding] = useState(false);
  const [initLoading, setInitLoading] = useState(!!initialAddress);

  // ── Khởi tạo map ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const map = L.map(mapDivRef.current, {
      center: VN_CENTER,
      zoom: 6,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Nếu có địa chỉ ban đầu → geocode để đặt marker
    if (initialAddress?.trim()) {
      forwardGeocode(initialAddress).then((coords) => {
        if (coords && mapRef.current) {
          placeMarker(coords[0], coords[1]);
          mapRef.current.setView(coords, 16);
        }
      }).finally(() => setInitLoading(false));
    }

    // Click bản đồ → reverse geocode
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      placeMarker(lat, lng);
      setGeocoding(true);
      try {
        const addr = await reverseGeocode(lat, lng);
        setSelectedAddress(addr);
      } finally {
        setGeocoding(false);
      }
    });

    return () => {
      map.remove();
      mapRef.current  = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function placeMarker(lat: number, lng: number) {
    if (!mapRef.current) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon: DEFAULT_ICON })
        .addTo(mapRef.current);
    }
  }

  // ── Render qua portal → không bị z-index cắt bởi dialog cha ─────────────
  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🗺</span>
            <div>
              <h3 className={styles.title}>Chọn địa chỉ trên bản đồ</h3>
              <p className={styles.subtitle}>Click vào bản đồ để ghim vị trí</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">✕</button>
        </div>

        {/* Map */}
        <div className={styles.mapWrap}>
          <div ref={mapDivRef} className={styles.map} />
          {initLoading && (
            <div className={styles.mapLoading}>
              <span className={styles.loadingSpinner} />
              Đang định vị địa chỉ...
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.addressRow}>
            <span className={styles.pinIcon}>📍</span>
            <span className={styles.addressText}>
              {geocoding
                ? <span className={styles.geocodingText}><span className={styles.loadingSpinner} /> Đang lấy địa chỉ...</span>
                : (selectedAddress || <span className={styles.placeholder}>Chưa chọn vị trí — click vào bản đồ</span>)
              }
            </span>
          </div>
          <div className={styles.footerActions}>
            <button className={styles.cancelBtn} onClick={onClose}>Huỷ</button>
            <button
              className={styles.confirmBtn}
              disabled={!selectedAddress || geocoding}
              onClick={() => onConfirm(selectedAddress)}
            >
              Chọn địa chỉ này
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
