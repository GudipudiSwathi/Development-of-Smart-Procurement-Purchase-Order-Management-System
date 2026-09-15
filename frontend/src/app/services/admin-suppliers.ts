import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Supplier {
  supplierId?: number;
  supplierName: string;
  phoneNumber: string;
  email: string;
  address: string;
  gstNumber: string;
  rating?: number | null;
  feedback?: string | null;
  status?: 'ACTIVE' | 'INACTIVE' | string;
  categoryId: number | null;
  categoryName?: string;
}

export interface SupplierRequest {
  supplierName: string;
  phoneNumber: string;
  email: string;
  address: string;
  gstNumber: string;
  rating: number | null;
  feedback: string;
  status?: string;
  categoryId: number | null;
}

export interface Category {
  categoryId: number;
  categoryName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminSuppliersService {

  private readonly supplierApiUrl = 'http://localhost:8080/suppliers';
  private readonly categoryApiUrl = 'http://localhost:8080/categories';

  constructor(private http: HttpClient) {}

  getAllSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.supplierApiUrl);
  }

  getSupplierById(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.supplierApiUrl}/${id}`);
  }

  getSuppliersByCategory(categoryId: number): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(
      `${this.supplierApiUrl}/category/${categoryId}`
    );
  }

  createSupplier(request: SupplierRequest): Observable<Supplier> {
    return this.http.post<Supplier>(
      this.supplierApiUrl,
      request
    );
  }

  updateSupplier(
    id: number,
    request: SupplierRequest
  ): Observable<Supplier> {
    return this.http.put<Supplier>(
      `${this.supplierApiUrl}/${id}`,
      request
    );
  }

  deleteSupplier(id: number): Observable<string> {
    return this.http.delete(
      `${this.supplierApiUrl}/${id}`,
      { responseType: 'text' }
    );
  }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoryApiUrl);
  }
}
