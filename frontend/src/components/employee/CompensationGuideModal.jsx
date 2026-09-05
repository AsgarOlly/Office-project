import React from 'react';
import { Modal } from '../common/Modal';
import {
  Scissors,
  TrendingUp,
  DollarSign,
  Clock,
  Award,
  Wallet,
  Sparkles,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export const CompensationGuideModal = ({ isOpen, onClose }) => {
  const { currency } = useApp();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Business Owner's Guide • How Employee Pay & Extra Work Works"
      maxWidth="680px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            borderLeft: '4px solid var(--primary)',
            fontSize: '0.85rem',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Info size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
          <span>
            Every employee in your factory/shop has a <strong>Guaranteed Base Salary</strong> plus <strong>Extra Earnings</strong> calculated by their job role and performance. As the Owner, you can edit and override any amount anytime!
          </span>
        </div>

        {/* The 3 Core Models */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          {/* 1. Piece Rate */}
          <div
            className="card"
            style={{
              padding: '14px',
              margin: 0,
              border: '1px solid rgba(52, 211, 153, 0.3)',
              background: 'rgba(52, 211, 153, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div
                style={{
                  background: 'rgba(52, 211, 153, 0.15)',
                  color: '#34D399',
                  padding: '8px',
                  borderRadius: '10px',
                  display: 'flex',
                }}
              >
                <Scissors size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  1. Tailors & Cutters (Piece-Rate Model)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Applied to Master Tailors, Stitchers, Coat Makers, and Cutters
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: '0 0 6px 0' }}>
              <strong>How extra pay is earned:</strong> Tailors earn money for every single garment they stitch or cut.
            </p>
            <div
              style={{
                background: 'var(--bg-surface)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                color: '#34D399',
              }}
            >
              Extra Pay = Pieces Completed (e.g. 18 pcs) × Rate per Piece ({formatCurrency(28.50, currency)}) = {formatCurrency(513.00, currency)}
            </div>
          </div>

          {/* 2. Sales Commission */}
          <div
            className="card"
            style={{
              padding: '14px',
              margin: 0,
              border: '1px solid rgba(96, 165, 250, 0.3)',
              background: 'rgba(96, 165, 250, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div
                style={{
                  background: 'rgba(96, 165, 250, 0.15)',
                  color: '#60A5FA',
                  padding: '8px',
                  borderRadius: '10px',
                  display: 'flex',
                }}
              >
                <TrendingUp size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  2. Showroom Sales & POS Cashiers (Commission Model)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Applied to Showroom Managers, Sales Executives, Cashiers
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: '0 0 6px 0' }}>
              <strong>How extra pay is earned:</strong> Sales staff earn a percentage of all sales orders they close.
            </p>
            <div
              style={{
                background: 'var(--bg-surface)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                color: '#60A5FA',
              }}
            >
              Extra Pay = Monthly Sales ({formatCurrency(8420, currency)}) × Commission (2.5%) = {formatCurrency(210.50, currency)}
            </div>
          </div>

          {/* 3. Fixed Salary */}
          <div
            className="card"
            style={{
              padding: '14px',
              margin: 0,
              border: '1px solid rgba(167, 139, 250, 0.3)',
              background: 'rgba(167, 139, 250, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div
                style={{
                  background: 'rgba(167, 139, 250, 0.15)',
                  color: '#A78BFA',
                  padding: '8px',
                  borderRadius: '10px',
                  display: 'flex',
                }}
              >
                <DollarSign size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  3. Quality Control, Finishing & Admin Staff (Fixed Model)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Applied to QC Leads, Ironing & Packaging Staff, Supervisors
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: '0 0 6px 0' }}>
              <strong>How extra pay is earned:</strong> Fixed guaranteed monthly salary + Overtime hours & Quality rating bonuses.
            </p>
          </div>
        </div>

        {/* Global Extras & Deductions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Clock size={16} /> Overtime (OT) Pay
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Auto-calculated from attendance logs: Overtime Hours Worked × Hourly OT Rate.
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#F43F5E', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Wallet size={16} /> Advance Loan Deductions
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              If staff took an advance loan, installments are auto-deducted until balance is ₹0.
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button className="btn btn-primary" onClick={onClose} style={{ alignSelf: 'flex-end', marginTop: '6px' }}>
          <CheckCircle2 size={16} /> Got It!
        </button>
      </div>
    </Modal>
  );
};
