import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Download,
  Scissors,
  Users,
  UserPlus,
  Trash2,
  Crown,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { NewBookingModal } from './NewBookingModal';
import { CustomerModal } from '../common/CustomerModal';
import { CustomerProfileModal } from '../customer/CustomerProfileModal';
import { StatCard } from '../common/StatCard';
import { exportTailorJobCardPDF } from '../../utils/pdfGenerator';

export const BookingView = () => {
  const { orderBookings, updateBookingStatus, measurements, customers, deleteCustomer, currency } = useApp();
  const [mainTab, setMainTab] = useState('bookings'); // 'bookings' or 'clients'
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [selectedCustomerFor360, setSelectedCustomerFor360] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [customerSearch, setCustomerSearch] = useState('');

  const totalAdvanceCollected = orderBookings.reduce((sum, b) => sum + (b.advancePaid || 0), 0);
  const totalBalanceDue = orderBookings.reduce((sum, b) => sum + (b.balanceDue || 0), 0);
  const activeBookings = orderBookings.filter((b) => b.status !== 'Delivered').length;

  const filteredBookings = orderBookings.filter(
    (b) => statusFilter === 'All' || b.status === statusFilter
  );

  const handleJobCardDownload = (booking) => {
    const custMeasurement = measurements.find((m) => m.customerId === booking.customerId);
    exportTailorJobCardPDF(booking, custMeasurement?.measurements || {});
  };

  const handleDeliverAndSettle = (booking) => {
    if (booking.balanceDue > 0) {
      if (
        window.confirm(
          `Collect balance payment of ${formatCurrency(booking.balanceDue, currency)} and mark as DELIVERED?`
        )
      ) {
        updateBookingStatus(booking.id, 'Delivered', booking.balanceDue);
      }
    } else {
      updateBookingStatus(booking.id, 'Delivered', 0);
    }
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Order Booking & Bespoke Tailoring</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Advance custom order bookings, deposit collection, trial fitting scheduling & client registry
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setIsNewCustomerOpen(true)}>
            <UserPlus size={16} /> + Register New Client
          </button>
          <button className="btn btn-primary" onClick={() => setIsNewBookingOpen(true)}>
            <Plus size={16} /> Book Custom Tailoring Order
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard
          label="Total Advance Collected"
          value={formatCurrency(totalAdvanceCollected, currency)}
          icon={DollarSign}
          color="#10B981"
          trend="Secured in advance"
          trendPositive={true}
        />
        <StatCard
          label="Pending Balance Due"
          value={formatCurrency(totalBalanceDue, currency)}
          icon={AlertCircle}
          color="#F43F5E"
          trend="Receivable upon delivery"
          trendPositive={false}
        />
        <StatCard
          label="Active In-Progress Bookings"
          value={`${activeBookings} Orders`}
          icon={Scissors}
          color="#6366F1"
        />
        <StatCard
          label="Registered Bespoke Clients"
          value={`${customers.length} Clients`}
          icon={Users}
          color="#38BDF8"
        />
      </div>

      {/* Main Tab Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn ${mainTab === 'bookings' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setMainTab('bookings')}
          >
            <CalendarCheck size={14} /> Custom Orders & Bookings ({orderBookings.length})
          </button>
          <button
            className={`btn ${mainTab === 'clients' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setMainTab('clients')}
          >
            <Users size={14} /> Clients & VIP Directory ({customers.length})
          </button>
        </div>

        {mainTab === 'bookings' ? (
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {['All', 'Booked', 'In Production', 'Ready for Trial', 'Delivered'].map((status) => (
              <button
                key={status}
                className={`category-pill ${statusFilter === status ? 'active' : ''}`}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        ) : (
          <input
            type="text"
            className="form-input"
            style={{ width: '240px', padding: '5px 10px', fontSize: '0.8rem' }}
            placeholder="Search clients by name, phone..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
          />
        )}
      </div>

      {/* Main Content Area */}
      {mainTab === 'bookings' ? (
        /* Bookings Table */
        <div className="card table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Customer Name</th>
                <th>Garment & Fabric Details</th>
                <th>Trial Date</th>
                <th>Delivery Date</th>
                <th>Agreed Total</th>
                <th>Advance Paid</th>
                <th>Balance Due</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)' }}>
                    No custom bookings found for this filter.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{b.bookingNo || b.id}</strong>
                    </td>
                    <td>
                      <div
                        style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--primary)' }}
                        onClick={() => {
                          const matched = customers.find((c) => c.id === b.customerId || c.name === b.customerName);
                          setSelectedCustomerFor360(matched || { id: b.customerId, name: b.customerName, phone: b.customerPhone, type: 'VIP Bespoke' });
                        }}
                        title="Click to view full 360° Customer Profile & Body Sizes"
                      >
                        {b.customerName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.customerPhone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.garmentType}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.fabricDetails}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                        <Clock size={12} color="#F59E0B" /> {formatDate(b.trialDate)}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-main)' }}>{formatDate(b.deliveryDate)}</strong>
                    </td>
                    <td>
                      <span className="font-mono">{formatCurrency(b.totalAmount, currency)}</span>
                    </td>
                    <td>
                      <span style={{ color: '#10B981', fontWeight: 700 }} className="font-mono">
                        {formatCurrency(b.advancePaid, currency)}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          color: b.balanceDue > 0 ? '#F43F5E' : '#10B981',
                          fontWeight: 700,
                        }}
                        className="font-mono"
                      >
                        {formatCurrency(b.balanceDue, currency)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          b.status === 'Delivered'
                            ? 'badge-success'
                            : b.status === 'Ready for Trial'
                            ? 'badge-cyan'
                            : b.status === 'In Production'
                            ? 'badge-warning'
                            : 'badge-primary'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleJobCardDownload(b)}
                          title="Download Cutting Sheet & Tailor Specs PDF"
                        >
                          <Download size={13} /> Job Card
                        </button>

                        {b.status !== 'Delivered' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleDeliverAndSettle(b)}
                            title="Settle balance due and mark as delivered"
                          >
                            <CheckCircle2 size={13} /> Settle & Deliver
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Clients & VIP Directory Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {customers
            .filter(
              (c) =>
                c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                c.phone.includes(customerSearch) ||
                c.id.toLowerCase().includes(customerSearch.toLowerCase())
            )
            .map((cust) => (
              <div key={cust.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                      👤
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{cust.name}</h3>
                      <span className="badge badge-primary font-mono" style={{ fontSize: '0.65rem' }}>{cust.id}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={`badge ${cust.type.includes('VIP') ? 'badge-warning' : 'badge-cyan'}`} style={{ fontSize: '0.7rem' }}>
                      {cust.type}
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete client "${cust.name}" (${cust.id})?`)) {
                          deleteCustomer(cust.id);
                        }
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#F43F5E', cursor: 'pointer', padding: '4px' }}
                      title="Delete Customer Profile"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '10px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                    <Phone size={13} color="var(--primary)" /> <span>{cust.phone}</span>
                  </div>
                  {cust.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                      <Mail size={13} color="var(--primary)" /> <span>{cust.email}</span>
                    </div>
                  )}
                  {cust.city && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                      <MapPin size={13} color="var(--primary)" /> <span>{cust.city}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed var(--border-color)', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Loyalty Points:</span>
                  <span style={{ color: '#F59E0B', fontWeight: 700 }}>{cust.loyaltyPoints || 0} pts</span>
                </div>

                {/* 360° Profile & Sizing Trigger Button */}
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setSelectedCustomerFor360(cust)}
                  style={{ width: '100%', marginTop: '4px', gap: '6px' }}
                >
                  <Scissors size={14} /> View 360° Profile, Sizes & Bills
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Modals */}
      <NewBookingModal isOpen={isNewBookingOpen} onClose={() => setIsNewBookingOpen(false)} />
      <CustomerModal isOpen={isNewCustomerOpen} onClose={() => setIsNewCustomerOpen(false)} />
      <CustomerProfileModal
        isOpen={Boolean(selectedCustomerFor360)}
        onClose={() => setSelectedCustomerFor360(null)}
        customer={selectedCustomerFor360}
      />
    </div>
  );
};


