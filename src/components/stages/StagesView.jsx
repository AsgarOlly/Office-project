import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GitBranch,
  Plus,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  Scissors,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { STAGES_LIST } from '../../data/seedData';
import { formatDate } from '../../utils/formatters';
import { NewBatchModal } from './NewBatchModal';
import { QCModal } from './QCModal';

export const StagesView = () => {
  const { productStages, advanceProductStage } = useApp();
  const [isNewBatchOpen, setIsNewBatchOpen] = useState(false);
  const [selectedBatchForQC, setSelectedBatchForQC] = useState(null);

  const getNextStageInfo = (currentStageName) => {
    const currentIndex = STAGES_LIST.findIndex((s) => s.name === currentStageName);
    if (currentIndex > -1 && currentIndex < STAGES_LIST.length - 1) {
      const nextStage = STAGES_LIST[currentIndex + 1];
      const progressVal = Math.round(((currentIndex + 2) / STAGES_LIST.length) * 100);
      return { nextStageName: nextStage.name, progressVal };
    }
    return null;
  };

  const handleAdvance = (batch) => {
    const nextInfo = getNextStageInfo(batch.currentStage);
    if (nextInfo) {
      advanceProductStage(batch.id, nextInfo.nextStageName, nextInfo.progressVal);
    }
  };

  return (
    <div className="view-container">
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Product Stages & Manufacturing Lifecycle</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time stage tracking from Fabric Inward {'->'} Cutting {'->'} Stitching {'->'} Embroidery {'->'} Finishing {'->'} QC {'->'} Showroom
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsNewBatchOpen(true)}>
          <Plus size={16} /> Initiate Production Batch
        </button>
      </div>

      {/* Kanban Board Container */}
      <div className="stages-kanban-board">
        {STAGES_LIST.map((stage, sIdx) => {
          const batchesInStage = productStages.filter((b) => b.currentStage === stage.name);

          return (
            <div key={stage.id} className="stage-column">
              {/* Stage Header */}
              <div
                className="stage-column-header"
                style={{
                  borderTop: `3px solid ${stage.color}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{stage.icon}</span>
                  <span style={{ fontSize: '0.85rem', color: '#FFF' }}>{stage.name}</span>
                </div>
                <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                  {batchesInStage.length}
                </span>
              </div>

              {/* Batches inside this stage */}
              <div className="stage-column-body">
                {batchesInStage.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                    No lots in this stage
                  </div>
                ) : (
                  batchesInStage.map((batch) => {
                    const nextInfo = getNextStageInfo(batch.currentStage);
                    return (
                      <div key={batch.id} className="stage-batch-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                            {batch.batchNo}
                          </span>
                          <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                            {batch.quantity} Pcs
                          </span>
                        </div>

                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFF', marginBottom: '4px' }}>
                          {batch.garmentType}
                        </h4>

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Client: <strong style={{ color: 'var(--text-main)' }}>{batch.clientName}</strong>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                          Master: {batch.assignedTo}
                        </div>

                        {/* Progress Bar */}
                        <div className="progress-bar-bg">
                          <div className="progress-bar-fill" style={{ width: `${batch.progress || 20}%` }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                          <span>Target: {formatDate(batch.targetDate)}</span>
                          <span>{batch.progress || 20}%</span>
                        </div>

                        {batch.qcStatus && (
                          <div style={{ marginTop: '8px' }}>
                            <span
                              className={`badge ${batch.qcStatus.includes('Passed')
                                ? 'badge-success'
                                : batch.qcStatus.includes('Rework')
                                  ? 'badge-warning'
                                  : 'badge-primary'
                                }`}
                              style={{ fontSize: '0.65rem' }}
                            >
                              {batch.qcStatus}
                            </span>
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                          {stage.id === 6 && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ flex: 1, fontSize: '0.7rem' }}
                              onClick={() => setSelectedBatchForQC(batch)}
                            >
                              <ShieldCheck size={12} color="#10B981" /> QC Check
                            </button>
                          )}

                          {nextInfo && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ flex: 1, fontSize: '0.7rem' }}
                              onClick={() => handleAdvance(batch)}
                              title={`Advance to ${nextInfo.nextStageName}`}
                            >
                              Next Stage <ArrowRight size={12} />
                            </button>
                          )}

                          {stage.id === 7 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981', fontSize: '0.75rem', fontWeight: 600 }}>
                              <CheckCircle2 size={14} /> In Showroom Stock
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <NewBatchModal isOpen={isNewBatchOpen} onClose={() => setIsNewBatchOpen(false)} />
      <QCModal
        isOpen={Boolean(selectedBatchForQC)}
        onClose={() => setSelectedBatchForQC(null)}
        batch={selectedBatchForQC}
      />
    </div>
  );
};
