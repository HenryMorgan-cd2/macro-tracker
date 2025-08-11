import { useState, useEffect } from 'react';
import { css } from '@emotion/react';
import { DailyTargets } from '../types';
import { api } from '../api';
import { DailyTargetsManager } from '../components/DailyTargetsManager';
import { PageWrapper } from '../components/PageWrapper';

const errorMessage = css`
  background: #f8d7da;
  color: #721c24;
  padding: var(--container-padding);
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
`;

const successMessage = css`
  background: #d4edda;
  color: #155724;
  padding: var(--container-padding);
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
  border: 1px solid #c3e6cb;
`;

export function DailyTargetsPage() {
  const [targets, setTargets] = useState<DailyTargets | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadTargets();
  }, []);

  const loadTargets = async () => {
    try {
      setLoading(true);
      setError(null);
      const targetsData = await api.getDailyTargets();
      setTargets(targetsData);
    } catch (err) {
      // If no targets exist yet, that's fine - start with empty targets
      if (err instanceof Error && err.message.includes('not found')) {
        setTargets(null);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load targets');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTargets = async (newTargets: DailyTargets) => {
    try {
      setError(null);
      setSuccess(null);
      
      if (targets?.id) {
        // Update existing targets
        await api.updateDailyTargets(targets.id, newTargets);
        setSuccess('Daily targets updated successfully!');
      } else {
        // Create new targets
        const createdTargets = await api.createDailyTargets(newTargets);
        setTargets(createdTargets);
        setSuccess('Daily targets created successfully!');
      }
      
      // Reload targets to get the latest data
      await loadTargets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save targets');
    }
  };

  const handleResetTargets = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      if (targets?.id) {
        await api.deleteDailyTargets(targets.id);
        setTargets(null);
        setSuccess('Daily targets reset to defaults!');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset targets');
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Daily Targets" subtitle="Set your daily macro targets">
        <div css={css`
          text-align: center;
          padding: clamp(2rem, 6vw, 3rem);
          color: #666;
          font-size: clamp(1rem, 3vw, 1.1rem);
        `}>
          Loading targets...
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Daily Targets" subtitle="Set your daily macro targets">
      {error && <div css={errorMessage}>{error}</div>}
      {success && <div css={successMessage}>{success}</div>}
      
      <DailyTargetsManager
        targets={targets}
        onSave={handleSaveTargets}
        onReset={handleResetTargets}
      />
    </PageWrapper>
  );
}
