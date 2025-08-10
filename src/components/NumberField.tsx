/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';

interface NumberFieldProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  step?: number;
  min?: number;
  required?: boolean;
}

export const NumberField: React.FC<NumberFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = "0",
  step = 0.1,
  min = 0,
  required = false
}) => {
  return (
    <div css={css`
      display: flex;
      flex-direction: column;
    `}>
      <label css={css`
        font-size: 0.75rem;
        font-weight: 600;
        color: #666;
        margin-bottom: 0.25rem;
      `}>
      {label}
      <br />
      <input
        css={css`
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.875rem;
          
          &:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
          }
        `}
        type="number"
        placeholder={placeholder}
        value={value ?? ''}
        onChange={(e) => {
          const value = e.target.value === '' ? null : parseFloat(e.target.value);
          onChange(value);
        }}
        step={step}
        min={min}
        required={required}
      />
      </label>
    </div>
  );
};
