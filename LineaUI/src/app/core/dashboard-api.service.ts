import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardSummary, Downtime, EquipmentStatus, HourlyProductionPoint } from './models';

@Injectable({
  providedIn: 'root',
})
export class DashboardApiService {
  private baseUrl = '/api/dashboard';

  constructor(private http: HttpClient) {}

  getSummary(from: string, to: string, lineName?: string): Observable<DashboardSummary> {
    let params = new HttpParams().set('from', from).set('to', to);
    if (lineName && lineName.trim().length > 0) {
      params = params.set('lineName', lineName.trim());
    }
    return this.http.get<DashboardSummary>(`${this.baseUrl}/summary`, { params });
  }

  getHourlyProduction(
    from: string,
    to: string,
    lineName?: string
  ): Observable<HourlyProductionPoint[]> {
    let params = new HttpParams().set('from', from).set('to', to);
    if (lineName && lineName.trim().length > 0) {
      params = params.set('lineName', lineName.trim());
    }
    return this.http.get<HourlyProductionPoint[]>(`${this.baseUrl}/hourly`, { params });
  }

  getActiveDowntimes(lineName?: string): Observable<Downtime[]> {
    let params = new HttpParams();
    if (lineName && lineName.trim().length > 0) {
      params = params.set('lineName', lineName.trim());
    }
    return this.http.get<Downtime[]>(`${this.baseUrl}/active-downtimes`, { params });
  }

  getEquipmentStatus(lineName?: string): Observable<EquipmentStatus[]> {
    let params = new HttpParams();
    if (lineName && lineName.trim().length > 0) {
      params = params.set('lineName', lineName.trim());
    }
    return this.http.get<EquipmentStatus[]>(`${this.baseUrl}/equipment-status`, { params });
  }

  addEquipment(equipment: {
    id: string;
    name: string;
    status: EquipmentStatus['status'];
    targetProductionRate: number;
  }): Observable<EquipmentStatus> {
    return this.http.post<EquipmentStatus>(`${this.baseUrl}/equipment`, equipment);
  }

  updateEquipment(
    equipmentId: string,
    updates: {
      name?: string;
      status?: EquipmentStatus['status'];
      targetProductionRate?: number;
    }
  ): Observable<EquipmentStatus> {
    return this.http.patch<EquipmentStatus>(`${this.baseUrl}/equipment/${equipmentId}`, updates);
  }

  setMaintenanceMode(
    equipmentId: string,
    data: { note?: string }
  ): Observable<EquipmentStatus> {
    return this.http.post<EquipmentStatus>(
      `${this.baseUrl}/equipment/${equipmentId}/maintenance`,
      data
    );
  }

  deleteEquipment(equipmentId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/equipment/${equipmentId}`);
  }
}
