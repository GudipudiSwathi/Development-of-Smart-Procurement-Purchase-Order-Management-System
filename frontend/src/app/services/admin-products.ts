import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/*
 * =========================================================
 * PRODUCT MODEL
 * =========================================================
 */

export interface Product {
  productId: number;
  name: string;
  price: number;
  numberOfQuantities: number;
  totalPrice: number;
  description: string;
  status: string;
  departmentId: number | null;
  categoryId: number | null;
  userId: number | null;
}


/*
 * =========================================================
 * PRODUCT CREATE / UPDATE REQUEST
 * =========================================================
 */

export interface ProductRequest {
  name: string;
  price: number;
  numberOfQuantities: number;
  totalPrice?: number;
  description: string;
  status?: string;
  departmentId: number;
  categoryId: number;
  userId: number;
}


/*
 * =========================================================
 * ADMIN PRODUCTS SERVICE
 * =========================================================
 */

@Injectable({
  providedIn: 'root'
})
export class AdminProductsService {

  private productsUrl =
    'http://localhost:8080/products';


  constructor(
    private http: HttpClient
  ) {}


  /*
   * =======================================================
   * GET ALL PRODUCTS
   * =======================================================
   */

  getAllProducts(): Observable<Product[]> {

    return this.http.get<Product[]>(
      this.productsUrl
    );
  }


  /*
   * =======================================================
   * GET PRODUCT BY ID
   * =======================================================
   */

  getProductById(
    productId: number
  ): Observable<Product> {

    return this.http.get<Product>(
      `${this.productsUrl}/${productId}`
    );
  }


  /*
   * =======================================================
   * CREATE PRODUCT
   * =======================================================
   */

  createProduct(
    product: ProductRequest
  ): Observable<Product> {

    return this.http.post<Product>(
      this.productsUrl,
      product
    );
  }


  /*
   * =======================================================
   * UPDATE PRODUCT
   * =======================================================
   */

  updateProduct(
    productId: number,
    product: ProductRequest
  ): Observable<Product> {

    return this.http.put<Product>(
      `${this.productsUrl}/${productId}`,
      product
    );
  }


  /*
   * =======================================================
   * DELETE PRODUCT
   * =======================================================
   */

  deleteProduct(
    productId: number
  ): Observable<string> {

    return this.http.delete(
      `${this.productsUrl}/${productId}`,
      {
        responseType: 'text'
      }
    );
  }


  /*
   * =======================================================
   * DOWNLOAD PRODUCTS CSV
   * =======================================================
   */

  downloadProductsCsv(): Observable<Blob> {

    return this.http.get(
      `${this.productsUrl}/download`,
      {
        responseType: 'blob'
      }
    );
  }
}
