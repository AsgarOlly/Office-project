import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { CalendarCheck, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const NewBookingModal = ({ isOpen, onClose }) => {
  const { customers, createOrderBooking, employees, currency } = useApp();

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [garmentType, setGarmentType] = useState('Italian Bespoke 3-Piece Suit');
  const [fabricDetails, setFabricDetails] = useState('Super 140s Merino Wool (Midnight Blue)');
  const [trialDate, setTrialDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [totalAmount, setTotalAmount] = useState('35000.00');
  const [advancePaid, setAdvancePaid] = useState('15000.00');
  const [assignedMaster, setAssignedMaster] = useState(employees[0]?.name || 'Master Harun (Master Tailor)');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === customerId);

    createOrderBooking({
      customerId,
      customerName: cust ? cust.name : 'Bespoke Client',
      customerPhone: cust ? cust.phone : 'N/A',
      garmentType,
      fabricDetails,
      trialDate: trialDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      deliveryDate: deliveryDate || new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      totalAmount: Number(totalAmount) || 0,
      advancePaid: Number(advancePaid) || 0,
      assignedMaster,
      specialInstructions,
    });

    onClose();
  };

  const balanceDue = Math.max(0, (Number(totalAmount) || 0) - (Number(advancePaid) || 0));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Custom Bespoke Tailoring Order"
      maxWidth="620px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label className="form-label">Client Name</label>
            <select
              className="form-select"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Garment Type</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. 3-Piece Tuxedo, Bandhgala Suit, Silk Lehenga"
              value={garmentType}
              onChange={(e) => setGarmentType(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="form-label">Selected Fabric & Trims Details</label>
          <input
            type="text"
            className="form-input"
            required
            placeholder="e.g. Italian Wool 140s + Gold Bemberg Lining + Horn Buttons"
            value={fabricDetails}
            onChange={(e) => setFabricDetails(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label className="form-label">Trial Fitting Date</label>
            <input
              type="date"
              className="form-input"
              required
              value={trialDate}
              onChange={(e) => setTrialDate(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Final Delivery Date</label>
            <input
              type="date"
              className="form-input"
              required
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
          </div>
        </div>

        {/* Pricing & Advance Deposit Collection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
          <div>
            <label className="form-label">Total Agreed Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-input font-mono"
              required
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Advance Paid Now</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-input font-mono"
              required
              value={advancePaid}
              onChange={(e) => setAdvancePaid(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Balance Due on Delivery</label>
            <div style={{ padding: '8px 12px', fontSize: '1rem', fontWeight: 800, color: balanceDue > 0 ? '#F43F5E' : '#10B981', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(balanceDue, currency)}
            </div>
          </div>
        </div>

        <div>
          <label className="form-label">Assigned Master Tailor / Craftsman</label>
          <select
            className="form-select"
            value={assignedMaster}
            onChange={(e) => setAssignedMaster(e.target.value)}
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.name}>
                {emp.name} ({emp.role})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Special Styling & Custom Notes</label>
          <textarea
            className="form-textarea"
            placeholder="Monogramming initials on left cuff, peaked lapel width, inner pocket sizing..."
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '6px' }}>
          <CalendarCheck size={18} /> Book Order, Collect Advance & Post to Ledger
        </button>
      </form>
    </Modal>
  );
};
