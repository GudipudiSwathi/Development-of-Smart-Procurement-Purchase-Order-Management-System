import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';

import {
  Observable,
  throwError,
  timeout,
  catchError
} from 'rxjs';


// =====================================================
// PURCHASE REQUEST ITEM
// =====================================================

export interface PurchaseRequestItem {

  productId: number;

  quantity: number;

  supplierId?: number;

}


// =====================================================
// PURCHASE REQUEST
// =====================================================

export interface PurchaseRequest {

  purchaseRequestId?: number;

  userId: number;

  totalPrice?: number;

  remarks?: string;

  adminRemarks?: string;

  status?: string;

  items: PurchaseRequestItem[];

}


// =====================================================
// PRODUCT
// =====================================================

export interface Product {

  productId: number;

  name: string;

  price: number;

  numberOfQuantities: number;

  totalPrice?: number;

  description: string;

  status: string;

  departmentId: number;

  categoryId: number;

  userId: number;

}


// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class PurchaseRequestService {


  // =====================================================
  // API URLS
  // =====================================================

  private readonly purchaseRequestUrl =
    'http://localhost:8080/purchase-requests';

  private readonly productUrl =
    'http://localhost:8080/products';


  // =====================================================
  // REQUEST TIMEOUT
  // =====================================================

  private readonly requestTimeout = 10000;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private http: HttpClient
  ) {}


  // =====================================================
  // GET ALL PURCHASE REQUESTS
  // ADMIN USE
  // =====================================================

  getAllPurchaseRequests():
    Observable<PurchaseRequest[]> {

    console.log(
      'PURCHASE REQUEST SERVICE: GET ALL REQUESTS'
    );

    return this.http
      .get<PurchaseRequest[]>(
        this.purchaseRequestUrl
      )
      .pipe(

        timeout(this.requestTimeout),

        catchError(
          (error: HttpErrorResponse | unknown) => {

            console.error(
              'GET ALL PURCHASE REQUESTS ERROR:',
              error
            );

            return throwError(
              () => this.handleError(error)
            );
          }
        )

      );
  }


  // =====================================================
  // GET MY PURCHASE REQUESTS
  // EMPLOYEE USE
  // =====================================================

  getMyPurchaseRequests():
    Observable<PurchaseRequest[]> {

    console.log(
      'PURCHASE REQUEST SERVICE: GET MY REQUESTS'
    );

    return this.http
      .get<PurchaseRequest[]>(
        `${this.purchaseRequestUrl}/my`
      )
      .pipe(

        timeout(this.requestTimeout),

        catchError(
          (error: HttpErrorResponse | unknown) => {

            console.error(
              'GET MY PURCHASE REQUESTS ERROR:',
              error
            );

            return throwError(
              () => this.handleError(error)
            );
          }
        )

      );
  }


  // =====================================================
  // GET PURCHASE REQUEST BY ID
  // EMPLOYEE / ADMIN
  // =====================================================

  getPurchaseRequestById(
    requestId: number
  ): Observable<PurchaseRequest> {

    console.log(
      'PURCHASE REQUEST SERVICE: GET REQUEST:',
      requestId
    );

    return this.http
      .get<PurchaseRequest>(
        `${this.purchaseRequestUrl}/${requestId}`
      )
      .pipe(

        timeout(this.requestTimeout),

        catchError(
          (error: HttpErrorResponse | unknown) => {

            console.error(
              'GET PURCHASE REQUEST BY ID ERROR:',
              error
            );

            return throwError(
              () => this.handleError(error)
            );
          }
        )

      );
  }


  // =====================================================
  // GET ALL PRODUCTS
  // EMPLOYEE USE
  // =====================================================

  getAllProducts():
    Observable<Product[]> {

    console.log(
      'PURCHASE REQUEST SERVICE: GET PRODUCTS'
    );

    return this.http
      .get<Product[]>(
        this.productUrl
      )
      .pipe(

        timeout(this.requestTimeout),

        catchError(
          (error: HttpErrorResponse | unknown) => {

            console.error(
              'GET PRODUCTS ERROR:',
              error
            );

            return throwError(
              () => this.handleError(error)
            );
          }
        )

      );
  }


  // =====================================================
  // CREATE PURCHASE REQUEST
  // =====================================================

  createPurchaseRequest(
    request: PurchaseRequest
  ): Observable<PurchaseRequest> {

    console.log(
      'PURCHASE REQUEST SERVICE: CREATE REQUEST'
    );

    console.log(
      'PURCHASE REQUEST PAYLOAD:',
      request
    );

    return this.http
      .post<PurchaseRequest>(
        this.purchaseRequestUrl,
        request
      )
      .pipe(

        timeout(this.requestTimeout),

        catchError(
          (error: HttpErrorResponse | unknown) => {

            console.error(
              'CREATE PURCHASE REQUEST ERROR:',
              error
            );

            return throwError(
              () => this.handleError(error)
            );
          }
        )

      );
  }


  // =====================================================
  // COMMON ERROR HANDLER
  // =====================================================

  private handleError(
    error: HttpErrorResponse | unknown
  ): Error {


    // ===================================================
    // HTTP ERROR
    // ===================================================

    if (error instanceof HttpErrorResponse) {


      // -----------------------------------------------
      // SERVER NOT REACHABLE
      // -----------------------------------------------

      if (error.status === 0) {

        return new Error(
          'Unable to connect to the server. Please make sure the Spring Boot backend is running.'
        );
      }


      // -----------------------------------------------
      // BAD REQUEST
      // -----------------------------------------------

      if (error.status === 400) {

        const message =
          this.extractBackendMessage(error);

        return new Error(
          message ||
          'Invalid purchase request. Please check the selected products and quantities.'
        );
      }


      // -----------------------------------------------
      // UNAUTHORIZED
      // -----------------------------------------------

      if (error.status === 401) {

        return new Error(
          'Your session has expired. Please login again.'
        );
      }


      // -----------------------------------------------
      // FORBIDDEN
      // -----------------------------------------------

      if (error.status === 403) {

        return new Error(
          'You do not have permission to create or view this purchase request.'
        );
      }


      // -----------------------------------------------
      // NOT FOUND
      // -----------------------------------------------

      if (error.status === 404) {

        return new Error(
          'Purchase request service was not found. Please check the backend.'
        );
      }


      // -----------------------------------------------
      // CONFLICT
      // -----------------------------------------------

      if (error.status === 409) {

        const message =
          this.extractBackendMessage(error);

        return new Error(
          message ||
          'The purchase request could not be created because of a conflict.'
        );
      }


      // -----------------------------------------------
      // SERVER ERROR
      // -----------------------------------------------

      if (error.status >= 500) {

        const message =
          this.extractBackendMessage(error);

        return new Error(
          message ||
          'Server error while processing the purchase request.'
        );
      }


      // -----------------------------------------------
      // OTHER HTTP ERROR
      // -----------------------------------------------

      const message =
        this.extractBackendMessage(error);

      return new Error(
        message ||
        `Request failed with status ${error.status}.`
      );
    }


    // ===================================================
    // TIMEOUT
    // ===================================================

    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      (error as any).name === 'TimeoutError'
    ) {

      return new Error(
        'The server took too long to respond. Please check whether the backend is running.'
      );
    }


    // ===================================================
    // NORMAL ERROR
    // ===================================================

    if (error instanceof Error) {

      return error;
    }


    return new Error(
      'Something went wrong while processing the purchase request.'
    );
  }


  // =====================================================
  // EXTRACT BACKEND MESSAGE
  // =====================================================

  private extractBackendMessage(
    error: HttpErrorResponse
  ): string | null {

    const body: any =
      error.error;


    if (!body) {
      return null;
    }


    // Backend returned plain text
    if (typeof body === 'string') {

      return body.trim() || null;
    }


    // Common Spring Boot error format
    if (body.message) {

      return String(
        body.message
      ).trim() || null;
    }


    if (body.error) {

      return String(
        body.error
      ).trim() || null;
    }


    if (body.detail) {

      return String(
        body.detail
      ).trim() || null;
    }


    // Validation errors
    if (body.errors) {

      if (Array.isArray(body.errors)) {

        const messages =
          body.errors
            .map(
              (item: any) =>
                item?.defaultMessage ||
                item?.message ||
                String(item)
            )
            .filter(Boolean);

        if (messages.length > 0) {

          return messages.join(', ');
        }
      }


      if (
        typeof body.errors === 'object'
      ) {

        const messages =
          Object.values(body.errors)
            .map(
              (value: any) =>
                String(value)
            )
            .filter(Boolean);

        if (messages.length > 0) {

          return messages.join(', ');
        }
      }
    }


    return null;
  }

}
