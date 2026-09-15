import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  categoryId: number;
  categoryName: string;
  departmentId: number;
  departmentName?: string;
}

export interface CategoryRequest {
  categoryName: string;
  departmentId: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminCategoriesService {

  private categoriesUrl = 'http://localhost:8080/categories';

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(
      this.categoriesUrl
    );
  }

  getCategoryById(categoryId: number): Observable<Category> {
    return this.http.get<Category>(
      `${this.categoriesUrl}/${categoryId}`
    );
  }

  createCategory(
    category: CategoryRequest
  ): Observable<Category> {
    return this.http.post<Category>(
      this.categoriesUrl,
      category
    );
  }

  updateCategory(
    categoryId: number,
    category: CategoryRequest
  ): Observable<Category> {
    return this.http.put<Category>(
      `${this.categoriesUrl}/${categoryId}`,
      category
    );
  }

  deleteCategory(
    categoryId: number
  ): Observable<string> {
    return this.http.delete(
      `${this.categoriesUrl}/${categoryId}`,
      {
        responseType: 'text'
      }
    );
  }

  getCategoriesByDepartment(
    departmentId: number
  ): Observable<Category[]> {
    return this.http.get<Category[]>(
      `http://localhost:8080/departments/${departmentId}/categories`
    );
  }
}
