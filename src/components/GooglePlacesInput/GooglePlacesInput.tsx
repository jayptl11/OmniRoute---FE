/**
 * GooglePlacesInput — reusable address autocomplete input
 * Dùng @googlemaps/js-api-loader (functional API v2) để load đúng cách.
 * setOptions() cài shim, importLibrary() load library lazy khi cần.
 */

import { useEffect, useRef } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

// ── Cấu hình một lần ở module level ─────────────────────────────────────────

setOptions({
  key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  v: 'weekly',
  language: 'vi',
  region: 'VN',
});

// ── Singleton promise — chỉ load Places library 1 lần ────────────────────────

let placesReady: Promise<google.maps.PlacesLibrary> | null = null;

function loadPlaces(): Promise<google.maps.PlacesLibrary> {
  if (!placesReady) {
    placesReady = importLibrary('places') as Promise<google.maps.PlacesLibrary>;
  }
  return placesReady;
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
  const inputRef = useRef<HTMLInputElement>(null);
  const acRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    let mounted = true;

    loadPlaces().then(({ Autocomplete }) => {
      if (!mounted || !inputRef.current || acRef.current) return;

      const ac = new Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country },
        fields: ['formatted_address'],
      });

      acRef.current = ac;

      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        if (place?.formatted_address) {
          onChange(place.formatted_address);
        }
      });
    }).catch(console.warn); // Không crash nếu API key lỗi

    return () => {
      mounted = false;
      if (acRef.current) {
        google.maps.event.clearInstanceListeners(acRef.current);
        acRef.current = null;
      }
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
