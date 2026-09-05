import React, { useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Printer, Download, Share2, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { exportInvoicePDF } from '../../utils/pdfGenerator';
import JsBarcode from 'jsbarcode';

export const ReceiptModal = ({ isOpen, onClose, order, currency = 'INR' }) => {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (isOpen && order && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, order.invoiceNo || order.id || 'INV-000', {
          format: 'CODE128',
          lineColor: '#000',
          width: 1.6,
          height: 38,
          displayValue: true,
          fontSize: 10,
          font: 'monospace',
        });
      } catch (err) {
        console.error('Barcode render error:', err);
      }
    }
  }, [isOpen, order]);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    exportInvoicePDF(order);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sale Completed • Invoice & Thermal Receipt"
      maxWidth="680px"
      footer={
        <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close & Next Order
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={handlePrint}>
              <Printer size={16} />
              Print Receipt (80mm)
            </button>
            <button className="btn btn-primary" onClick={handleDownloadPDF}>
              <Download size={16} />
              Download A4 GST Tax Invoice (PDF)
            </button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        {/* Success Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#10B981',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <CheckCircle2 size={18} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            Payment Approved ({order.paymentMethod?.toUpperCase()}) • Stock Adjusted
          </span>
        </div>

        {/* 80mm Thermal Receipt Paper Mockup */}
        <div className="thermal-receipt-paper" id="printable-receipt">
          <div className="receipt-center">
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 2px 0' }}>
              THREADCRAFT APPAREL
            </h3>
            <div style={{ fontSize: '11px', color: '#555' }}>
              142 Sartorial Row, Fashion District
            </div>
            <div style={{ fontSize: '11px', color: '#555' }}>
              GSTIN: 27AABCT3518Q1ZS | Tel: 555-234-5678
            </div>
            <hr />
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
              TAX INVOICE / POS RECEIPT
            </div>
          </div>

          <div style={{ margin: '8px 0', fontSize: '11px' }}>
            <div className="receipt-row">
              <span>Invoice:</span>
              <strong>{order.invoiceNo || order.id}</strong>
            </div>
            <div className="receipt-row">
              <span>Date:</span>
              <span>{order.date}</span>
            </div>
            <div className="receipt-row">
              <span>Customer:</span>
              <span>{order.customerName}</span>
            </div>
            <div className="receipt-row">
              <span>Cashier:</span>
              <span>{order.cashier?.split(' ')?.[0] || 'Staff'}</span>
            </div>
          </div>

          <hr />

          {/* Items */}
          <div style={{ margin: '8px 0' }}>
            <div className="receipt-row" style={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', paddingBottom: '3px' }}>
              <span>Item Description</span>
              <span>Qty x Price</span>
            </div>
            {order.items?.map((item, idx) => (
              <div key={idx} style={{ marginTop: '6px' }}>
                <div style={{ fontWeight: 600, fontSize: '12px' }}>{item.name}</div>
                <div className="receipt-row" style={{ fontSize: '11px', color: '#444' }}>
                  <span>
                    Size: {item.size || 'M'} | {item.color || 'Std'}
                  </span>
                  <span>
                    {item.quantity} × {formatCurrency(item.price, currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <hr />

          {/* Totals */}
          <div style={{ fontSize: '12px' }}>
            <div className="receipt-row">
              <span>Subtotal:</span>
              <span>{formatCurrency(order.subtotal, currency)}</span>
            </div>
            {order.discountTotal > 0 && (
              <div className="receipt-row" style={{ color: '#c00' }}>
                <span>Discount:</span>
                <span>-{formatCurrency(order.discountTotal, currency)}</span>
              </div>
            )}
            <div className="receipt-row">
              <span>GST / Tax (12%):</span>
              <span>{formatCurrency(order.tax, currency)}</span>
            </div>
            <hr />
            <div className="receipt-row" style={{ fontSize: '15px', fontWeight: 'bold' }}>
              <span>GRAND TOTAL:</span>
              <span>{formatCurrency(order.total, currency)}</span>
            </div>
            <div className="receipt-row" style={{ fontSize: '11px', marginTop: '4px' }}>
              <span>Paid Via:</span>
              <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{order.paymentMethod}</span>
            </div>
          </div>

          <hr />

          <div className="receipt-center" style={{ fontSize: '10px', color: '#666', marginTop: '6px' }}>
            <div>Thank you for shopping with us!</div>
            <div>Exchange valid within 7 days with tag.</div>
          </div>

          {/* Barcode Output */}
          <div className="barcode-svg-container">
            <svg ref={barcodeRef} style={{ maxWidth: '100%' }}></svg>
          </div>
        </div>
      </div>
    </Modal>
  );
};
