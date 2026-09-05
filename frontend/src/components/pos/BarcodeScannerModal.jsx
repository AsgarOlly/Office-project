import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { ScanBarcode, Plus, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const BarcodeScannerModal = ({ isOpen, onClose }) => {
  const { products, addToCart, currency } = useApp();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [matchedProduct, setMatchedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const handleSearch = (code) => {
    setBarcodeInput(code);
    const found = products.find(
      (p) => p.barcode === code.trim() || p.sku.toLowerCase() === code.trim().toLowerCase()
    );
    if (found) {
      setMatchedProduct(found);
      setSelectedSize(found.sizes?.[0] || 'Standard');
      setSelectedColor(found.colors?.[0] || 'Default');
    } else {
      setMatchedProduct(null);
    }
  };

  const handleScanAdd = (prod) => {
    addToCart(prod, { size: selectedSize || prod.sizes?.[0], color: selectedColor || prod.colors?.[0] });
    setBarcodeInput('');
    setMatchedProduct(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hardware Barcode / SKU Scanner Simulator"
      maxWidth="550px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Scan a garment tag barcode or enter SKU code to immediately add the variant to the active POS ticket.
        </p>

        {/* Input Bar */}
        <div style={{ position: 'relative' }}>
          <ScanBarcode
            size={20}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--primary)',
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '40px', fontSize: '1rem', fontFamily: 'var(--font-mono)' }}
            placeholder="Scan / Type Barcode or SKU (e.g. 890100101001 or SH-EGY-01)..."
            value={barcodeInput}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
        </div>

        {/* Quick Sample Barcode Tags to Click */}
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Quick Sample Garment Tags (Click to test):
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
            {products.slice(0, 5).map((p) => (
              <button
                key={p.id}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleSearch(p.barcode)}
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              >
                🏷️ {p.sku} ({p.name.slice(0, 18)}...)
              </button>
            ))}
          </div>
        </div>

        {/* Matched Garment Preview */}
        {matchedProduct && (
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--primary-border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginTop: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ fontSize: '2.5rem' }}>{matchedProduct.image}</div>
              <div>
                <h4 style={{ fontSize: '1rem', color: '#FFF' }}>{matchedProduct.name}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Fabric: {matchedProduct.fabric} | Brand: {matchedProduct.brand}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34D399', marginTop: '2px' }}>
                  {formatCurrency(matchedProduct.price, currency)}
                </div>
              </div>
            </div>

            {/* Select Size and Color */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div>
                <label className="form-label">Variant Size</label>
                <select
                  className="form-select"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                >
                  {matchedProduct.sizes?.map((s) => (
                    <option key={s} value={s}>
                      Size: {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Color / Shade</label>
                <select
                  className="form-select"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                >
                  {matchedProduct.colors?.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => handleScanAdd(matchedProduct)}
            >
              <Plus size={16} />
              Add Scanned Item to Cart
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
