import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { GitBranch, Layers } from 'lucide-react';
import { STAGES_LIST } from '../../data/seedData';

export const NewBatchModal = ({ isOpen, onClose }) => {
  const { createProductBatch, employees } = useApp();

  const [garmentType, setGarmentType] = useState('Italian Bespoke 3-Piece Suit');
  const [clientName, setClientName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [targetDate, setTargetDate] = useState('');
  const [assignedTo, setAssignedTo] = useState(employees[0]?.name || 'Master Tailor');
  const [fabricCode, setFabricCode] = useState('FAB-WOOL-ITA');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    createProductBatch({
      garmentType,
      clientName: clientName.trim() || 'Showroom Stock Batch',
      quantity: Number(quantity) || 1,
      targetDate: targetDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      assignedTo,
      fabricCode,
      notes,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Initiate Garment Production Batch / Job Lot"
      maxWidth="600px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label className="form-label">Garment Type / Product Description</label>
          <input
            type="text"
            className="form-input"
            required
            placeholder="e.g. Bespoke Tuxedo, Oxford Cotton Shirts Lot, Silk Sherwani"
            value={garmentType}
            onChange={(e) => setGarmentType(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label className="form-label">Client Name / Destination</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. VIP Alexander Wright or Showroom Stock"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Batch Quantity (Pieces)</label>
            <input
              type="number"
              min="1"
              className="form-input"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label className="form-label">Assigned Master / Craftsman</label>
            <select
              className="form-select"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.name}>
                  {emp.name} ({emp.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Target Completion Date</label>
            <input
              type="date"
              className="form-input"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="form-label">Fabric Batch & Material Specs</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Super 140s Wool (Navy), Silk Lining 2.5m"
            value={fabricCode}
            onChange={(e) => setFabricCode(e.target.value)}
          />
        </div>

        <div>
          <label className="form-label">Styling & Cutting Instructions</label>
          <textarea
            className="form-textarea"
            placeholder="Special lapel canvas, buttonhole thread shade, cuff styling..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '6px' }}>
          <Layers size={18} /> Launch Manufacturing Lot in Sourcing Stage
        </button>
      </form>
    </Modal>
  );
};
