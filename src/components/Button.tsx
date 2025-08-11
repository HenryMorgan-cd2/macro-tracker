/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';

interface ButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  buttonStyle: 'solid' | 'outline';
  color: string;
  size?: 'regular' | 'large';
  className?: string;
  isSubmit?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  disabled = false,
  onClick,
  buttonStyle,
  color,
  size = 'regular',
  className = '',
  isSubmit = false
}) => {
  const buttonStyles = css`
    font-weight: 500;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: none;
    outline: none;
    font-family: inherit;
    
    ${size === 'large' 
      ? css`
        padding: clamp(10px, 3vw, 12px) clamp(20px, 5vw, 24px);
        font-size: clamp(14px, 3.5vw, 16px);
        min-height: clamp(44px, 10vw, 48px);
      `
      : css`
        padding: clamp(8px, 2.5vw, 8px) clamp(14px, 4vw, 16px);
        font-size: clamp(13px, 3vw, 14px);
        min-height: clamp(44px, 8vw, 36px);
      `
    }
    
    ${buttonStyle === 'solid'
      ? css`
        background-color: ${color};
        color: white;
        &:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `
      : css`
        background-color: transparent;
        color: ${color};
        border: 2px solid ${color};
        &:hover:not(:disabled) {
          background-color: ${color};
          color: white;
          transform: translateY(-1px);
        }
        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `
    }
    
    ${disabled
      ? css`
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
        filter: grayscale(0.5);
      `
      : css``
    }
    
    ${className}
  `;

  return (
    <button
      type={isSubmit ? 'submit' : 'button'}
      disabled={disabled}
      onClick={onClick}
      css={buttonStyles}
    >
      {children}
    </button>
  );
};
