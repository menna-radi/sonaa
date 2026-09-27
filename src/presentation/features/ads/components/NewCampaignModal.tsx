import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { TextField, Select } from '../../../components/ui/FormFields';

interface NewCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, budget: number, placement: string) => Promise<void>;
  loading?: boolean;
}

export const NewCampaignModal: React.FC<NewCampaignModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [name, setName] = useState('');
  const [placement, setPlacement] = useState('Home Banner');
  const [budget, setBudget] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Campaign name is required');
      return;
    }
    const numBudget = parseFloat(budget);
    if (isNaN(numBudget) || numBudget <= 0) {
      setError('Please enter a valid budget');
      return;
    }

    setError(null);
    try {
      await onSubmit(name.trim(), numBudget, placement);
      setName('');
      setBudget('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Launch New Campaign">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        {error && (
          <div
            style={{
              padding: 'var(--sp-2) var(--sp-3)',
              background: 'var(--danger-soft)',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            {error}
          </div>
        )}

        <TextField
          label="Campaign Name"
          placeholder="e.g. Jerusalem Plumber Discount Deal"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Select
          label="Placement"
          value={placement}
          onChange={(e) => setPlacement(e.target.value)}
          options={[
            { value: 'Home Banner', label: 'Home Banner' },
            { value: 'Search Results', label: 'Search Results' },
            { value: 'Popups', label: 'Popups' },
            { value: 'Category Page', label: 'Category Page' },
          ]}
        />

        <TextField
          label="Budget (ILS)"
          type="number"
          placeholder="e.g. 5000"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          required
          min={1}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Create Campaign
          </Button>
        </div>
      </form>
    </Modal>
  );
};
