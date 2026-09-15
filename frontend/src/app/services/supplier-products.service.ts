import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SupplierProduct {
  productId?: number;
  name: string;
  price: number;
  numberOfQuantities: number;
  totalPrice?: number | null;
  description: string;
  status?: string;
  departmentId?: number | null;
  categoryId?: number | null;
  userId?: number | null;
  departmentName?: string;
  categoryName?: string;
}

export interface SupplierProductRequest {
  name: string;
  price: number;
  numberOfQuantities: number;
  totalPrice: number;
  description: string;
  status: string;
  departmentId: number;
  categoryId: number;
  userId: number;
}

@Injectable({ providedIn: 'root' })
export class SupplierProductsService {
  private readonly apiUrl = 'http://localhost:8080/products';

  constructor(private http: HttpClient) {}

  getMyProducts(): Observable<SupplierProduct[]> {
    return this.http.get<SupplierProduct[]>(`${this.apiUrl}/my`);
  }

  createProduct(request: SupplierProductRequest): Observable<SupplierProduct> {
    return this.http.post<SupplierProduct>(`${this.apiUrl}/supplier`, request);
  }

  updateProduct(id: number, request: SupplierProductRequest): Observable<SupplierProduct> {
    return this.http.put<SupplierProduct>(`${this.apiUrl}/supplier/${id}`, request);
  }

  deleteProduct(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/supplier/${id}`, { responseType: 'text' });
  }
}
