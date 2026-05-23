import { Search, X } from 'lucide-react';
import {
  type CSSProperties,
  type ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils';
import styles from './SearchableUserPicker.module.css';

export type SearchableUserPickerOption<T = unknown> = {
  value: string;
  label: string;
  subLabel?: string;
  note?: string;
  raw: T;
};

type BaseProps<T> = {
  id?: string;
  value?: string;
  selectedOption?: SearchableUserPickerOption<T> | null;
  onChange: (option: SearchableUserPickerOption<T> | null) => void;
  placeholder?: string;
  emptyMessage?: string;
  loadingMessage?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  allowClear?: boolean;
  compact?: boolean;
  className?: string;
  inputClassName?: string;
  dropdownClassName?: string;
  style?: CSSProperties;
  showSelectionSummary?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type LocalProps<T> = BaseProps<T> & {
  mode: 'local';
  options: SearchableUserPickerOption<T>[];
  filterOption?: (option: SearchableUserPickerOption<T>, query: string) => boolean;
};

type RemoteProps<T> = BaseProps<T> & {
  mode: 'remote';
  options: SearchableUserPickerOption<T>[];
  isLoading?: boolean;
  onSearch: (query: string) => void;
  fetchOnOpen?: boolean;
  minQueryLength?: number;
};

export type SearchableUserPickerProps<T = unknown> = LocalProps<T> | RemoteProps<T>;

export function SearchableUserPicker<T>({
  id,
  value,
  selectedOption,
  onChange,
  placeholder = 'Tìm người dùng...',
  emptyMessage = 'Không tìm thấy kết quả.',
  loadingMessage = 'Đang tìm...',
  disabled = false,
  autoFocus = false,
  allowClear = true,
  compact = false,
  className,
  inputClassName,
  dropdownClassName,
  style,
  showSelectionSummary = false,
  onOpenChange,
  ...modeProps
}: SearchableUserPickerProps<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lastEmittedQueryRef = useRef<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState(selectedOption?.label ?? '');
  const [debouncedSearchText, setDebouncedSearchText] = useState(searchText);
  const dropdownId = id ? `${id}-options` : undefined;
  const isRemote = modeProps.mode === 'remote';
  const remoteSearch = isRemote ? modeProps.onSearch : undefined;
  const remoteFetchOnOpen = isRemote ? modeProps.fetchOnOpen ?? false : false;
  const remoteMinQueryLength = isRemote ? modeProps.minQueryLength ?? 0 : 0;
  const remoteLoading = isRemote ? !!modeProps.isLoading : false;
  const baseOptions = modeProps.options;
  const filterOption = modeProps.mode === 'local' ? modeProps.filterOption : undefined;

  useEffect(() => {
    setSearchText(selectedOption?.label ?? '');
  }, [selectedOption?.label, selectedOption?.value, value]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearchText(searchText), 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    onOpenChange?.(isOpen);
    if (!isOpen) {
      lastEmittedQueryRef.current = null;
    }
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    if (!isRemote || !isOpen || !remoteSearch) {
      return;
    }

    const query = debouncedSearchText.trim();

    if (query.length === 0 && !remoteFetchOnOpen) {
      return;
    }

    if (query.length < remoteMinQueryLength) {
      return;
    }

    if (lastEmittedQueryRef.current === query) {
      return;
    }

    lastEmittedQueryRef.current = query;
    remoteSearch(query);
  }, [debouncedSearchText, isOpen, isRemote, remoteFetchOnOpen, remoteMinQueryLength, remoteSearch]);

  const options = useMemo(() => {
    if (isRemote) {
      return baseOptions;
    }

    const query = searchText.trim().toLowerCase();
    if (!query) {
      return baseOptions;
    }

    return baseOptions.filter((option) => {
      if (filterOption) {
        return filterOption(option, searchText);
      }

      return [option.label, option.subLabel, option.note]
        .filter(Boolean)
        .some((part) => part!.toLowerCase().includes(query));
    });
  }, [baseOptions, filterOption, isRemote, searchText]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setSearchText(nextValue);

    if (selectedOption && nextValue !== selectedOption.label) {
      onChange(null);
    }

    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleSelect = (option: SearchableUserPickerOption<T>) => {
    onChange(option);
    setSearchText(option.label);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchText('');
    onChange(null);
    setIsOpen(true);
  };

  const shouldShowDropdown = isOpen && !disabled;
  const showEmptyState =
    shouldShowDropdown &&
    !remoteLoading &&
    options.length === 0 &&
    (!isRemote || searchText.trim().length > 0 || remoteFetchOnOpen);

  return (
    <div ref={rootRef} className={cn(styles.root, className)} style={style}>
      <div className={styles.inputWrap}>
        <Search size={14} className={styles.searchIcon} />
        <input
          id={id}
          className={cn(styles.input, compact && styles.compactInput, inputClassName)}
          placeholder={placeholder}
          value={searchText}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="off"
          aria-expanded={shouldShowDropdown}
          aria-haspopup="listbox"
          aria-controls={dropdownId}
        />
        {allowClear && (selectedOption || searchText) && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleClear}
            aria-label="Xóa lựa chọn"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {shouldShowDropdown && (
        <div id={dropdownId} className={cn(styles.dropdown, dropdownClassName)} role="listbox">
          {remoteLoading ? (
            <div className={styles.message}>{loadingMessage}</div>
          ) : null}

          {!remoteLoading &&
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  styles.option,
                  selectedOption?.value === option.value && styles.optionSelected,
                )}
                onClick={() => handleSelect(option)}
                role="option"
                aria-selected={selectedOption?.value === option.value}
              >
                <div className={styles.optionMain}>
                  <span className={cn(styles.optionLabel, compact && styles.compactLabel)}>
                    {option.label}
                  </span>
                  {option.subLabel ? (
                    <span className={styles.optionSubLabel}>{option.subLabel}</span>
                  ) : null}
                  {option.note ? <span className={styles.optionNote}>{option.note}</span> : null}
                </div>
                {selectedOption?.value === option.value ? (
                  <span className={styles.selectedBadge}>Đã chọn</span>
                ) : null}
              </button>
            ))}

          {showEmptyState ? <div className={styles.message}>{emptyMessage}</div> : null}
        </div>
      )}

      {showSelectionSummary && selectedOption ? (
        <div className={styles.summary}>
          <span className={styles.summaryLabel}>{selectedOption.label}</span>
          {selectedOption.subLabel ? (
            <span className={styles.summarySubLabel}>{selectedOption.subLabel}</span>
          ) : null}
          {selectedOption.note ? <span className={styles.summaryNote}>{selectedOption.note}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
