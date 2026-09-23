import React from 'react';
import { X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import "../components/FilterSheet.css";

export default function FilterSheet({
  isOpen,
  onClose,
  // filter states
  position, setPosition,
  level, setLevel,
  type, setType,
  industry, setIndustry,
  salaryRange, setSalaryRange,
  MAX_SALARY,
  clearFilters,
}) {
  if (!isOpen) return null;

  const minVal = salaryRange[0];
  const maxVal = salaryRange[1];

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const activeCount = () => {
    let count = 0;
    if (position !== 'all') count++;
    if (level !== 'all') count++;
    if (type !== 'all') count++;
    if (industry !== 'all') count++;
    if (salaryRange[0] > 0 || salaryRange[1] < MAX_SALARY) count++;
    return count;
  };

  return (
    <div className="filter-sheet-backdrop" onClick={handleBackdropClick}>
      <div className="filter-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Handle bar */}
        <div className="filter-sheet-handle"></div>

        {/* Header */}
        <div className="filter-sheet-header">
          <h2>Filter Jobs</h2>
          <button className="filter-sheet-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="filter-sheet-content">
          {/* Position */}
          <div className="filter-sheet-item">
            <label>Position</label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger className="filter-sheet-trigger">
                <SelectValue placeholder="All Positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="AI Product Manager">AI Product Manager</SelectItem>
                <SelectItem value="AI Researcher">AI Researcher</SelectItem>
                <SelectItem value="Computer Vision Engineer">Computer Vision Engineer</SelectItem>
                <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                <SelectItem value="ML Engineer">ML Engineer</SelectItem>
                <SelectItem value="NLP Engineer">NLP Engineer</SelectItem>
                <SelectItem value="Quant Researcher">Quant Researcher</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Level */}
          <div className="filter-sheet-item">
            <label>Level</label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="filter-sheet-trigger">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="entry">Entry Level</SelectItem>
                <SelectItem value="mid">Mid Level</SelectItem>
                <SelectItem value="senior">Senior Level</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type */}
          <div className="filter-sheet-item">
            <label>Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="filter-sheet-trigger">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Industry */}
          <div className="filter-sheet-item">
            <label>Industry</label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="filter-sheet-trigger">
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="Automotive">Automotive</SelectItem>
                <SelectItem value="E-commerce">E-commerce</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
                <SelectItem value="Tech">Tech</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Salary */}
          <div className="filter-sheet-item">
            <label>Salary Range</label>
            <div className="filter-sheet-salary-value">
              ${minVal.toLocaleString()} — ${maxVal.toLocaleString()}
            </div>
            <div className="filter-sheet-slider-wrapper">
              <Slider
                value={salaryRange}
                onValueChange={setSalaryRange}
                max={MAX_SALARY}
                step={1000}
                className="salary-slider"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="filter-sheet-actions">
          <button
            className="filter-sheet-reset"
            onClick={clearFilters}
          >
            Reset
          </button>
          <button
            className="filter-sheet-apply"
            onClick={onClose}
          >
            Apply {activeCount() > 0 && `(${activeCount()})`}
          </button>
        </div>
      </div>
    </div>
  );
}