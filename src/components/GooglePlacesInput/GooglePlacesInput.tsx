/**
 * GooglePlacesInput — reusable address autocomplete input
 * Dùng Google Maps JavaScript API (Places Autocomplete)
 * Không cần npm package bổ sung.
 *
 * Props:
 *   id          — html id cho input (accessibility)
 *   value       — giá trị hiện tại của field
 *   onChange    — callback khi user chọn hoặc gõ tay
 *   className   — CSS class cho input element
 *   placeholder — placeholder text
 *   country     — ISO 3166-1 alpha-2 để restrict kết quả (mặc định 'vn')
 */

import { useEffect, useRef } from 'react';

// ── Load Google Maps script (singleton) ──────────────────────────────────────

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

let scriptLoaded = false;
let loadCallbacks: (() => void)[] = [];

function loadGoogleMapsScript(cb: () => void) {
  if (typeof window === 'undefined') return;

  // Đã load xong
  if (
    window.google?.maps?.places
  ) {
    cb();
    return;
  }

  loadCallbacks.push(cb);

  if (scriptLoaded) return; // đang load
  scriptLoaded = true;

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=vi&region=VN`;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    loadCallbacks.forEach((fn) => fn());
    loadCallbacks = [];
  };
  document.head.appendChild(script);
}

// ── Component ─────────────────────────────────────────────────────────────────

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
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    let isMounted = true;

    loadGoogleMapsScript(() => {
      if (!isMounted || !inputRef.current) return;
      if (autocompleteRef.current) return; // đã init

      const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country },
        fields: ['formatted_address'],
      });

      autocompleteRef.current = ac;

      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        if (place?.formatted_address) {
          onChange(place.formatted_address);
        }
      });
    });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      className={className}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete="off"
    />
  );
}
