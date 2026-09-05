import api from './api';

export const ledgerService = {
  getEntries: () => api.get('/ledger/entries'),
  createEntry: (data) => api.post('/ledger/entries', data),
  getStages: () => api.get('/ledger/stages'),
  updateStage: (batchNo, data) => api.patch(`/ledger/stages/${batchNo}`, data),
};

export default ledgerService;
