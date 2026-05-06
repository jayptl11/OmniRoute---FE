import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import styles from './GlassSelect.module.css';

interface Option {
  value: string;
  label: string;
}

interface GlassSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export function GlassSelect({ id, value, onChange, options, placeholder = 'Select...', className = '' }: GlassSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const selectedOption = options.find((opt) => opt.value === value);

  const updatePosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  const toggleOpen = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  // Handle outside click & scroll to close
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = (e: Event) => {
      // Do NOT close if the scroll is happening inside the dropdown panel itself
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) {
        return;
      }
      // Also ignore scroll events from the trigger container
      if (containerRef.current && containerRef.current.contains(e.target as Node)) {
        return;
      }
      // Scroll happened outside → reposition or close
      setIsOpen(false);
    };

    const handleResize = () => setIsOpen(false);

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, updatePosition]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`${styles.container} ${className}`} ref={containerRef}>
      <button
        id={id}
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
        onClick={toggleOpen}
      >
        <span className={selectedOption ? styles.value : styles.placeholder}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={14} className={`${styles.icon} ${isOpen ? styles.iconOpen : ''}`} />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className={styles.dropdown} 
          ref={dropdownRef}
          style={{ 
            position: 'absolute', 
            top: coords.top, 
            left: coords.left, 
            width: coords.width, 
            zIndex: 99999, /* High z-index to escape modals */
            margin: 0,
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.option} ${value === opt.value ? styles.optionSelected : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
