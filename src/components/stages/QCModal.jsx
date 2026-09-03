import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export const QCModal = ({ isOpen, onClose, batch }) => {
  const { updateQCStatus } = useApp();
  const [status, setStatus] = useState('QC Passed (Grade A)');
  const [remarks, setRemarks] = useState('');

  if (!batch) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateQCStatus(batch.id, status, remarks);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Quality Control Inspection • ${batch.batchNo}`}
      maxWidth="550px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Garment Batch:</div>
          <strong style={{ fontSize: '1rem', color: '#FFF' }}>{batch.garmentType}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Lot Size: {batch.quantity} Pcs | Master: {batch.assignedTo}
          </div>
        </div>

        <div>
          <label className="form-label">Inspection Outcome</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              className={`btn ${status.includes('Passed') ? 'btn-success' : 'btn-secondary'} btn-sm`}
              onClick={() => setStatus('QC Passed (Grade A)')}
            >
              <CheckCircle2 size={14} /> Passed (A)
            </button>
            <button
              type="button"
              className={`btn ${status.includes('Rework') ? 'btn-warning' : 'btn-secondary'} btn-sm`}
              onClick={() => setStatus('Rework Needed (Minor Alteration)')}
            >
              <AlertTriangle size={14} /> Rework
            </button>
            <button
              type="button"
              className={`btn ${status.includes('Rejected') ? 'btn-danger' : 'btn-secondary'} btn-sm`}
              onClick={() => setStatus('Rejected (Defect)')}
            >
              <XCircle size={14} /> Reject
            </button>
          </div>
        </div>

        <div>
          <label className="form-label">QC Lead Inspector Observations</label>
          <textarea
            className="form-textarea"
            placeholder="Seam puckering, collar symmetry, button tension, hem alignment..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-lg">
          <ShieldCheck size={18} /> Record Quality Inspection
        </button>
      </form>
    </Modal>
  );
};
