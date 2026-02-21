import { GenerateReportRequest } from '@shared/services';

export function createEmptyReportRequest(): GenerateReportRequest {
  return {
    date: undefined,
    shift: null,
    lineName: undefined,
    equipmentId: undefined,
  };
}
