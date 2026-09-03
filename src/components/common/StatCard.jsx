import React from 'react';

export const StatCard = ({ label, value, icon: Icon, trend, trendPositive, color = '#6366F1' }) => {
  return (
    <div className="stat-card">
      <div
        className="stat-icon"
        style={{
          background: `${color}20`,
          color: color,
          border: `1px solid ${color}40`,
        }}
      >
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <div className="stat-value">{value}</div>
        {trend && (
          <div
            className="stat-trend"
            style={{ color: trendPositive ? '#10B981' : '#F43F5E' }}
          >
            <span>{trendPositive ? '↑' : '↓'}</span>
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
};
