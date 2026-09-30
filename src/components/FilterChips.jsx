// src/components/FilterChips.jsx
import { X } from 'lucide-react';
import './FilterChips.css';

export default function FilterChips({ filters, onRemove, onClearAll }) {
  // Filter เฉพาะที่มีค่า
  const activeChips = [];

  if (filters.position && filters.position !== 'all') {
    activeChips.push({ key: 'position', label: filters.position });
  }
  if (filters.level && filters.level !== 'all') {
    activeChips.push({ key: 'level', label: filters.level });
  }
  if (filters.type && filters.type !== 'all') {
    activeChips.push({ key: 'type', label: filters.type });
  }
  if (filters.industry && filters.industry !== 'all') {
    activeChips.push({ key: 'industry', label: filters.industry });
  }
  if (filters.q) {
    activeChips.push({ key: 'q', label: `"${filters.q}"` });
  }

  const hasSalary =
    (filters.salary_min && filters.salary_min > 0) ||
    (filters.salary_max && filters.salary_max < 250000);

  if (hasSalary) {
    const min = filters.salary_min || 0;
    const max = filters.salary_max || 250000;
    activeChips.push({
      key: 'salary',
      label: `$${(min / 1000).toFixed(0)}K — $${(max / 1000).toFixed(0)}K`,
    });
  }

  if (activeChips.length === 0) return null;

  return (
    <div className="filter-chips-row">
      <span className="filter-chips-label">Active:</span>
      <div className="filter-chips-list">
        {activeChips.map((chip) => (
          <span key={chip.key} className="filter-chip">
            <span className="filter-chip-text">{chip.label}</span>
            <button
              type="button"
              className="filter-chip-remove"
              onClick={() => onRemove(chip.key)}
              aria-label={`Remove ${chip.key} filter`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <button
        type="button"
        className="filter-chips-clear"
        onClick={onClearAll}
      >
        Clear all
      </button>
    </div>
  );
}