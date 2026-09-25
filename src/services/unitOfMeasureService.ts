import { api } from './api';
import type { UnitOfMeasure } from '../types';

export const unitOfMeasureService = {
  async getUnitsOfMeasure(): Promise<UnitOfMeasure[]> {
    return api.get<UnitOfMeasure[]>('/api/v1/units-of-measure');
  }
};
