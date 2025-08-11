import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { css } from '@emotion/react';
import { Button } from './Button';

interface SiteWrapperProps {
  children: ReactNode;
}

const siteContainer = css`
  min-height: 100vh;
  background: #f8f9fa;
`;

const navigation = css`
  background: white;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const navContent = css`
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: clamp(0.75rem, 3vw, 1rem) var(--container-padding);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 0;
  }
`;

const navLinks = css`
  display: flex;
  flex-wrap: wrap;
  gap: clamp(1rem, 3vw, 2rem);
  align-items: center;
  justify-content: center;
  
  @media (min-width: 768px) {
    justify-content: flex-start;
  }
`;

const navLink = css`
  text-decoration: none;
  color: #666;
  font-weight: 500;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    color: #333;
  }
  
  &.active {
    color: #007bff;
    border-bottom-color: #007bff;
  }
`;

const addMealButton = css`
  align-self: center;
  
  @media (min-width: 768px) {
    align-self: auto;
  }
`;

export function SiteWrapper({ children }: SiteWrapperProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  return (
    <div css={siteContainer}>
      <nav css={navigation}>
        <div css={navContent}>
          <div css={navLinks}>
            <Link 
              to="/" 
              css={navLink} 
              className={location.pathname === '/' ? 'active' : ''}
            >
              Meals
            </Link>
            <Link 
              to="/templates" 
              css={navLink} 
              className={location.pathname === '/templates' ? 'active' : ''}
            >
              Ingredient Templates
            </Link>
            <Link 
              to="/meal-templates" 
              css={navLink} 
              className={location.pathname === '/meal-templates' ? 'active' : ''}
            >
              Meal Templates
            </Link>
          </div>
          
          <Button
            buttonStyle="solid"
            color="#28a745"
            size="regular"
            onClick={() => navigate('/add-meal')}
            css={addMealButton}
          >
            + Add Meal
          </Button>
        </div>
      </nav>
      {children}
    </div>
  );
}
