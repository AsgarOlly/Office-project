import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { DollarSign, Wallet, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const AdvanceLoanModal = ({ isOpen, onClose, employee }) => {
  const { grantEmployeeAdvanceLoan, currency } = useApp();

  const [loanAmount, setLoanAmount] = useState('200.00');
  const [monthlyDeduction, setMonthlyDeduction] = useState('50.00');

  if (!employee) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    grantEmployeeAdvanceLoan(employee.id, loanAmount, monthlyDeduction);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Grant Advance Salary / Loan • ${employee.name}`}
      maxWidth="500px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Current Advance Status */}
        <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Employee ID:</span>
            <strong style={{ color: 'var(--text-main)' }}>{employee.empId}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Unpaid Advance:</span>
            <strong style={{ color: '#FB7185', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(employee.advanceLoanRemaining || 0, currency)}
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly Base Salary:</span>
            <span style={{ color: '#34D399', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(employee.baseSalary || 0, currency)}
            </span>
          </div>
        </div>

        <div>
          <label className="form-label">New Advance Loan Amount (₹)</label>
          <input
            type="number"
            step="100"
            min="100"
            className="form-input font-mono"
            style={{ fontSize: '1.1rem', fontWeight: 'bold' }}
            required
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
          />
        </div>

        <div>
          <label className="form-label">Monthly Recovery Installment Deduction (₹)</label>
          <input
            type="number"
            step="100"
            min="50"
            className="form-input font-mono"
            required
            value={monthlyDeduction}
            onChange={(e) => setMonthlyDeduction(e.target.value)}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
            This amount will be auto-deducted from employee's monthly piece-rate & salary payslips.
          </span>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '8px' }}>
          <Wallet size={18} /> Disburse Advance Loan & Post to Accounts Ledger
        </button>
      </form>
    </Modal>
  );
};
