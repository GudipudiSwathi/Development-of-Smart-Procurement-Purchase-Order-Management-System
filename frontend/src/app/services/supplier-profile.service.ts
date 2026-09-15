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

export interface SupplierProfile {

  profileId?: number;

  businessName: string;
  businessType: string;
  description: string;
  website: string;

  contactPerson: string;
  contactEmail: string;
  contactPhone: string;

  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;

  gstNumber: string;
  panNumber: string;
  businessRegistrationNumber: string;
}


@Injectable({
  providedIn: 'root'
})
export class SupplierProfileService {

  private readonly apiUrl =
    'http://localhost:8080/supplier/profile';

  private readonly requestTimeout = 10000;


  constructor(
    private http: HttpClient
  ) {}


  // =========================================================
  // GET MY PROFILE
  // =========================================================

  getMyProfile(): Observable<SupplierProfile> {

    console.log(
      'SUPPLIER PROFILE: GET REQUEST:',
      this.apiUrl
    );

    return this.http
      .get<SupplierProfile>(this.apiUrl)
      .pipe(

        timeout(this.requestTimeout),

        catchError(
          (error: HttpErrorResponse | unknown) => {

            console.error(
              'GET SUPPLIER PROFILE ERROR:',
              error
            );

            return throwError(
              () => this.handleError(error)
            );
          }
        )

      );
  }


  // =========================================================
  // UPDATE MY PROFILE
  // =========================================================

  updateMyProfile(
    profile: SupplierProfile
  ): Observable<SupplierProfile> {

    const profileToSave: SupplierProfile = {
      ...profile,

      businessName:
        profile.businessName?.trim() || '',

      businessType:
        profile.businessType?.trim() || '',

      description:
        profile.description?.trim() || '',

      website:
        profile.website?.trim() || '',

      contactPerson:
        profile.contactPerson?.trim() || '',

      contactEmail:
        profile.contactEmail?.trim() || '',

      contactPhone:
        profile.contactPhone?.trim() || '',

      address:
        profile.address?.trim() || '',

      city:
        profile.city?.trim() || '',

      state:
        profile.state?.trim() || '',

      pincode:
        profile.pincode?.trim() || '',

      country:
        profile.country?.trim() || 'India',

      gstNumber:
        profile.gstNumber?.trim() || '',

      panNumber:
        profile.panNumber?.trim() || '',

      businessRegistrationNumber:
        profile.businessRegistrationNumber?.trim() || ''
    };

    console.log(
      'SUPPLIER PROFILE: UPDATE REQUEST:',
      profileToSave
    );

    return this.http
      .put<SupplierProfile>(
        this.apiUrl,
        profileToSave
      )
      .pipe(

        timeout(this.requestTimeout),

        catchError(
          (error: HttpErrorResponse | unknown) => {

            console.error(
              'UPDATE SUPPLIER PROFILE ERROR:',
              error
            );

            return throwError(
              () => this.handleError(error)
            );
          }
        )

      );
  }


  // =========================================================
  // ERROR HANDLER
  // =========================================================

  private handleError(
    error: HttpErrorResponse | unknown
  ): Error {

    if (error instanceof HttpErrorResponse) {

      if (error.status === 0) {

        return new Error(
          'Unable to connect to the server. Please make sure the Spring Boot backend is running.'
        );
      }

      if (error.status === 400) {

        const backendMessage =
          this.extractBackendMessage(error);

        return new Error(
          backendMessage ||
          'Invalid supplier profile information.'
        );
      }

      if (error.status === 401) {

        return new Error(
          'Your session has expired. Please login again.'
        );
      }

      if (error.status === 403) {

        return new Error(
          'You do not have permission to access the supplier profile.'
        );
      }

      if (error.status === 404) {

        return new Error(
          'Supplier profile service was not found.'
        );
      }

      if (error.status === 409) {

        const backendMessage =
          this.extractBackendMessage(error);

        return new Error(
          backendMessage ||
          'This supplier profile already exists.'
        );
      }

      if (error.status >= 500) {

        return new Error(
          'Server error while saving the supplier profile. Please try again.'
        );
      }

      const backendMessage =
        this.extractBackendMessage(error);

      return new Error(
        backendMessage ||
        `Request failed with status ${error.status}.`
      );
    }


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


    if (error instanceof Error) {
      return error;
    }


    return new Error(
      'Something went wrong while processing the supplier profile.'
    );
  }


  // =========================================================
  // EXTRACT BACKEND ERROR MESSAGE
  // =========================================================

  private extractBackendMessage(
    error: HttpErrorResponse
  ): string | null {

    const body: any = error.error;

    if (!body) {
      return null;
    }

    if (typeof body === 'string') {

      return body.trim() || null;
    }

    if (body.message) {

      return String(body.message).trim() || null;
    }

    if (body.error) {

      return String(body.error).trim() || null;
    }

    if (body.detail) {

      return String(body.detail).trim() || null;
    }

    if (body.errors) {

      if (Array.isArray(body.errors)) {

        return body.errors
          .map((item: any) =>
            item?.defaultMessage ||
            item?.message ||
            String(item)
          )
          .filter(Boolean)
          .join(', ');
      }

      if (typeof body.errors === 'object') {

        return Object.values(body.errors)
          .map((value: any) => String(value))
          .filter(Boolean)
          .join(', ');
      }
    }

    return null;
  }

}
