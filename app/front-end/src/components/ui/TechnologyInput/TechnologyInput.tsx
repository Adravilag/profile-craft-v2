// src/components/ui/TechnologyInput/TechnologyInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import styles from './TechnologyInput.module.css';

interface TechnologyInputProps {
  value: string[];
  onChange: (technologies: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  maxTechnologies?: number;
  className?: string;
  onInputChange?: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const TechnologyInput: React.FC<TechnologyInputProps> = ({
  value = [],
  onChange,
  suggestions = [],
  placeholder = 'Escribe y presiona Enter para agregar...',
  error = false,
  disabled = false,
  maxTechnologies,
  className,
  onInputChange,
  onKeyDown,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = suggestions
    .filter(tech => tech.toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(tech))
    .slice(0, 8);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(newValue.length > 0);
    setSelectedSuggestionIndex(-1);
    onInputChange?.(newValue);
  };

  const handleAddTechnology = (tech: string) => {
    const trimmedTech = tech.trim();
    if (
      trimmedTech &&
      !value.includes(trimmedTech) &&
      (!maxTechnologies || value.length < maxTechnologies)
    ) {
      onChange([...value, trimmedTech]);
      setInputValue('');
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
      inputRef.current?.focus();
    }
  };

  const handleRemoveTechnology = (index: number) => {
    const newTechnologies = value.filter((_, i) => i !== index);
    onChange(newTechnologies);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && filteredSuggestions[selectedSuggestionIndex]) {
        handleAddTechnology(filteredSuggestions[selectedSuggestionIndex]);
      } else if (inputValue.trim()) {
        handleAddTechnology(inputValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showSuggestions && filteredSuggestions.length > 0) {
        setSelectedSuggestionIndex(prev => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showSuggestions && filteredSuggestions.length > 0) {
        setSelectedSuggestionIndex(prev => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      handleRemoveTechnology(value.length - 1);
    }

    onKeyDown?.(e);
  };

  const handleSuggestionClick = (tech: string) => {
    handleAddTechnology(tech);
  };

  const handleInputFocus = () => {
    if (inputValue.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 200);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={clsx(styles.technologyInput, className)}>
      <div className={clsx(styles.inputContainer, { [styles.error]: error })}>
        {/* Selected Technologies */}
        {value.length > 0 && (
          <div className={styles.technologies}>
            {value.map((tech, index) => (
              <div key={index} className={styles.technologyTag}>
                <span>{tech}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTechnology(index)}
                  disabled={disabled}
                  className={styles.removeButton}
                  aria-label={`Eliminar ${tech}`}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Field */}
        <div className={styles.inputWrapper}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={value.length === 0 ? placeholder : ''}
            disabled={disabled || (maxTechnologies ? value.length >= maxTechnologies : false)}
            className={styles.input}
          />

          <button
            type="button"
            onClick={() => handleAddTechnology(inputValue)}
            disabled={
              !inputValue.trim() ||
              disabled ||
              (maxTechnologies ? value.length >= maxTechnologies : false)
            }
            className={styles.addButton}
            aria-label="Agregar tecnología"
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div ref={suggestionsRef} className={styles.suggestions}>
          {filteredSuggestions.map((tech, index) => (
            <button
              key={tech}
              type="button"
              onClick={() => handleSuggestionClick(tech)}
              className={clsx(styles.suggestionItem, {
                [styles.selected]: index === selectedSuggestionIndex,
              })}
            >
              {tech}
            </button>
          ))}
        </div>
      )}

      {/* Helper Text */}
      {maxTechnologies && (
        <div className={styles.helperText}>
          {value.length}/{maxTechnologies} tecnologías
        </div>
      )}
    </div>
  );
};
