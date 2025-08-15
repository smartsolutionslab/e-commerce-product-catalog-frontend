import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Product, Category, CreateProductRequest, UpdateProductRequest } from '../models/product.model';

@Injectable()
export class ProductService {
  private readonly baseUrl = '/api/v1';
  
  private productsSubject = new BehaviorSubject<Product[]>([]);
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  
  public products$ = this.productsSubject.asObservable();
  public categories$ = this.categoriesSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadProducts(params: {
    page: number;
    pageSize: number;
    search?: string;
    categoryId?: string;
    status?: string;
  }): void {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.categoryId) {
      httpParams = httpParams.set('categoryId', params.categoryId);
    }
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }

    this.http.get<{ products: Product[] }>(`${this.baseUrl}/products`, { params: httpParams })
      .pipe(tap(response => this.productsSubject.next(response.products)))
      .subscribe();
  }

  loadCategories(): void {
    this.http.get<Category[]>(`${this.baseUrl}/categories`)
      .pipe(tap(categories => this.categoriesSubject.next(categories)))
      .subscribe();
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  createProduct(product: CreateProductRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`${this.baseUrl}/products`, product);
  }

  updateProduct(id: string, product: UpdateProductRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/products/${id}`, product);
  }

  updateProductPrice(id: string, price: number, currency: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/products/${id}/price`, { price, currency });
  }

  updateProductInventory(id: string, quantity: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/products/${id}/inventory`, { quantity });
  }

  toggleProductStatus(id: string, activate: boolean): Observable<void> {
    const endpoint = activate ? 'activate' : 'deactivate';
    return this.http.put<void>(`${this.baseUrl}/products/${id}/${endpoint}`, {});
  }

  createCategory(category: { name: string; description: string; parentCategoryId?: string }): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`${this.baseUrl}/categories`, category);
  }
}
