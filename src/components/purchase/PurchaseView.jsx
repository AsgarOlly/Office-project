import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Truck,
  Plus,
  PackageCheck,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Trash2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { NewPOModal } from './NewPOModal';
import { VendorModal } from './VendorModal';
import { StatCard } from '../common/StatCard';

export const PurchaseView = () => {
  const { purchaseOrders, vendors, receiveStockFromPO, deleteVendor, currency } = useApp();
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' or 'vendors'
  const [isNewPOOpen, setIsNewPOOpen] = useState(false);
  const [isVendorOpen, setIsVendorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const totalPayables = vendors.reduce((acc, v) => acc + (v.balancePayable || 0), 0);
  const pendingOrders = purchaseOrders.filter((po) => po.status === 'Ordered').length;
  const completedOrders = purchaseOrders.filter((po) => po.status === 'Completed').length;

  const filteredPOs = purchaseOrders.filter(
    (po) =>
      po.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="view-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Purchase Orders & Sourcing</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage raw fabric rolls, accessories procurement, textile mills, and auto stock replenishment
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setIsVendorOpen(true)}>
            <Building2 size={16} /> Add Supplier
          </button>
          <button className="btn btn-primary" onClick={() => setIsNewPOOpen(true)}>
            <Plus size={16} /> Create Purchase Order
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard
          label="Total Vendor Payables"
          value={formatCurrency(totalPayables, currency)}
          icon={Building2}
          color="#F43F5E"
          trend="Outstanding Bills"
          trendPositive={false}
        />
        <StatCard
          label="Open POs In Transit"
          value={`${pendingOrders} Orders`}
          icon={Truck}
          color="#F59E0B"
        />
        <StatCard
          label="Completed Inwards"
          value={`${completedOrders} Batches`}
          icon={PackageCheck}
          color="#10B981"
        />
        <StatCard
          label="Registered Textile Mills"
          value={`${vendors.length} Partners`}
          icon={Building2}
          color="#6366F1"
        />
      </div>

      {/* View Switcher Tabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn ${activeTab === 'pos' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('pos')}
          >
            <Truck size={14} /> Purchase Orders ({purchaseOrders.length})
          </button>
          <button
            className={`btn ${activeTab === 'vendors' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('vendors')}
          >
            <Building2 size={14} /> Suppliers & Mills ({vendors.length})
          </button>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '34px', fontSize: '0.85rem' }}
            placeholder="Search PO / Supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'pos' ? (
        <div className="table-responsive card">
          <table className="data-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Supplier / Mill</th>
                <th>Order Date</th>
                <th>Expected Date</th>
                <th>Line Items</th>
                <th>Total Value</th>
                <th>Payment Status</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)' }}>
                    No purchase orders found. Click "+ Create Purchase Order" to raise an inward order.
                  </td>
                </tr>
              ) : (
                filteredPOs.map((po) => (
                  <tr key={po.id}>
                    <td>
                      <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{po.id}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{po.vendorName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {po.vendorId}</div>
                    </td>
                    <td>{formatDate(po.orderDate)}</td>
                    <td>{formatDate(po.expectedDate)}</td>
                    <td>
                      <div style={{ fontSize: '0.8rem' }}>
                        {po.items?.map((item, idx) => (
                          <div key={idx} style={{ color: 'var(--text-muted)' }}>
                            • {item.name} ({item.qty} units)
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: '#34D399', fontFamily: 'var(--font-mono)' }}>
                        {formatCurrency(po.total, currency)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        Paid: {formatCurrency(po.paidAmount || 0, currency)}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          po.paymentStatus === 'Paid'
                            ? 'badge-success'
                            : po.paymentStatus === 'Partial Paid'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {po.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          po.status === 'Completed'
                            ? 'badge-success'
                            : po.status === 'Ordered'
                            ? 'badge-warning'
                            : 'badge-primary'
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                    <td>
                      {po.status !== 'Completed' ? (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => receiveStockFromPO(po.id)}
                          title="Verify delivery, add to inventory stock & record goods inward"
                        >
                          <PackageCheck size={14} /> Receive Goods
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={14} /> Stock Inwarded
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Vendors Directory Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {vendors.map((v) => (
            <div key={v.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={20} color="var(--primary)" />
                  </div>
                  <span className="badge badge-primary font-mono">{v.id}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge badge-warning">{v.rating || 5.0} ★</span>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete vendor "${v.name}" (${v.id}) from registry?`)) {
                        deleteVendor(v.id);
                      }
                    }}
                    style={{ background: 'transparent', border: 'none', color: '#F43F5E', cursor: 'pointer', padding: '4px' }}
                    title="Delete Vendor"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{v.name}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {v.category} • {v.city}
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', background: 'var(--bg-surface)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
                <div>Contact: <strong style={{ color: 'var(--text-main)' }}>{v.contactPerson}</strong></div>
                <div>Phone: {v.phone}</div>
                <div>GSTIN: {v.gstin || 'N/A'}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Balance Payable:</span>
                <span style={{ fontWeight: 800, color: (v.balancePayable || 0) > 0 ? '#F43F5E' : '#10B981', fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(v.balancePayable || 0, currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <NewPOModal isOpen={isNewPOOpen} onClose={() => setIsNewPOOpen(false)} />
      <VendorModal isOpen={isVendorOpen} onClose={() => setIsVendorOpen(false)} />
    </div>
  );
};
