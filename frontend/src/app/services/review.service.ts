import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  reviewId?: number;
  purchaseRequestId: number;
  productId: number;
  productName?: string;
  employeeId?: number;
  employeeName?: string;
  supplierId?: number;
  supplierName?: string;
  rating: number;
  feedback?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewRequest {
  purchaseRequestId: number;
  productId: number;
  rating: number;
  feedback?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly apiUrl = 'http://localhost:8080/reviews';

  constructor(private http: HttpClient) {}

  createReview(request: ReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, request);
  }

  getMyReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/my`);
  }

  getSupplierReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/supplier`);
  }

  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/all`);
  }
}
