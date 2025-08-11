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
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const navLinks = css`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const navLink = css`
  text-decoration: none;
  color: #666;
  font-weight: 500;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  
  &:hover {
    color: #333;
  }
  
  &.active {
    color: #007bff;
    border-bottom-color: #007bff;
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
          >
            + Add Meal
          </Button>
        </div>
      </nav>
      {children}
    </div>
  );
}
