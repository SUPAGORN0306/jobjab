// src/components/SalaryPopover.jsx
import { useState, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Slider } from '@/components/ui/slider';
import { DollarSign, X } from 'lucide-react';
import './SalaryPopover.css';

const MAX_SALARY = 250000;

export default function SalaryPopover({
  salaryMin = 0,
  salaryMax = MAX_SALARY,
  onApply,
  onClear,
}) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState([salaryMin, salaryMax]);

  // Sync กับ props เมื่อเปิด popover
  useEffect(() => {
    if (open) {
      setRange([salaryMin, salaryMax]);
    }
  }, [open, salaryMin, salaryMax]);

  const isActive = salaryMin > 0 || salaryMax < MAX_SALARY;
  const [minVal, maxVal] = range;

  const handleApply = () => {
    onApply(minVal, maxVal);
    setOpen(false);
  };

  const handleClear = () => {
    setRange([0, MAX_SALARY]);
    onClear();
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={`salary-popover-trigger ${isActive ? 'is-active' : ''}`}
        >
          <DollarSign size={14} />
          <span>Salary</span>
          {isActive && (
            <span className="salary-popover-badge">
              ${(salaryMin / 1000).toFixed(0)}K-${(salaryMax / 1000).toFixed(0)}K
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="salary-popover-content"
          sideOffset={8}
          align="start"
        >
          <div className="salary-popover-header">
            <span>Salary Range</span>
            <Popover.Close asChild>
              <button className="salary-popover-close" aria-label="Close">
                <X size={14} />
              </button>
            </Popover.Close>
          </div>

          <div className="salary-popover-values">
            <span className="salary-popover-val">
              ${minVal.toLocaleString()}
            </span>
            <span className="salary-popover-dash">—</span>
            <span className="salary-popover-val">
              ${maxVal.toLocaleString()}
            </span>
          </div>

          <div className="salary-popover-slider">
            <Slider
              value={range}
              onValueChange={setRange}
              max={MAX_SALARY}
              step={1000}
            />
          </div>

          <div className="salary-popover-actions">
            <button
              type="button"
              className="salary-popover-btn-clear"
              onClick={handleClear}
            >
              Clear
            </button>
            <button
              type="button"
              className="salary-popover-btn-apply"
              onClick={handleApply}
            >
              Apply
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}