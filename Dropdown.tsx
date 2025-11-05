import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './Icons';

interface DropdownOption {
  value: string | number;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  ariaLabel: string;
  disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ options, value, onChange, ariaLabel, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (newValue: string | number) => {
    onChange(newValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full sm:w-auto" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-semibold text-left text-neumorphic-text bg-neumorphic-bg rounded-lg shadow-neumorphic-outset active:shadow-neumorphic-inset transition-shadow duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : '...'}</span>
        <ChevronDownIcon className={`w-5 h-5 ml-2 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full min-w-max mt-2 overflow-auto bg-neumorphic-bg rounded-lg shadow-neumorphic-outset">
          <ul role="listbox" aria-label={ariaLabel} className="p-2 space-y-1">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`px-4 py-2 text-sm cursor-pointer rounded-md transition-all ${option.value === value ? 'font-semibold text-slate-700 shadow-neumorphic-inset' : 'text-slate-500 hover:shadow-neumorphic-inset'}`}
                role="option"
                aria-selected={option.value === value}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;