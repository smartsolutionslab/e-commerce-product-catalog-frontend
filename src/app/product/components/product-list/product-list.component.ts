import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Product, Category } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Products</h1>
        <ec-button variant="primary" (clicked)="createProduct()">
          Add Product
        </ec-button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search products..."
              [(ngModel)]="searchTerm"
              (input)="onSearch()"
              class="w-full border border-gray-300 rounded-md px-3 py-2">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              [(ngModel)]="selectedCategory" 
              (change)="onCategoryChange()"
              class="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">All Categories</option>
              <option *ngFor="let category of categories$ | async" [value]="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              [(ngModel)]="selectedStatus" 
              (change)="onStatusChange()"
              class="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Discontinued">Discontinued</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">View</label>
            <div class="flex space-x-2">
              <button 
                (click)="viewMode = 'grid'"
                [class]="viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
                class="px-3 py-2 rounded-md">
                <i class="fas fa-th"></i>
              </button>
              <button 
                (click)="viewMode = 'list'"
                [class]="viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
                class="px-3 py-2 rounded-md">
                <i class="fas fa-list"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid View -->
      <div *ngIf="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div *ngFor="let product of products$ | async" 
             class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
             (click)="viewProduct(product.id)">
          <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
            <img [src]="product.imageUrl || 'assets/placeholder-product.png'" 
                 [alt]="product.name"
                 class="h-48 w-full object-cover object-center">
          </div>
          <div class="p-4">
            <h3 class="text-lg font-medium text-gray-900 truncate">{{ product.name }}</h3>
            <p class="text-sm text-gray-500 truncate">{{ product.sku }}</p>
            <div class="mt-2 flex items-center justify-between">
              <p class="text-lg font-bold text-gray-900">
                {{ product.price | currency:product.currency }}
              </p>
              <span [class]="getStatusClass(product.status)"
                    class="px-2 py-1 text-xs font-medium rounded-full">
                {{ product.status }}
              </span>
            </div>
            <div class="mt-2 flex items-center justify-between text-sm text-gray-500">
              <span>Stock: {{ product.stockQuantity }}</span>
              <span *ngIf="product.stockQuantity <= product.minStockLevel" 
                    class="text-red-600 font-medium">
                Low Stock
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div *ngIf="viewMode === 'list'" class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let product of products$ | async" 
                class="hover:bg-gray-50 cursor-pointer"
                (click)="viewProduct(product.id)">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img class="h-10 w-10 rounded-lg object-cover" 
                       [src]="product.imageUrl || 'assets/placeholder-product.png'" 
                       [alt]="product.name">
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                    <div class="text-sm text-gray-500 truncate max-w-xs">{{ product.description }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ product.sku }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ product.categoryName }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ product.price | currency:product.currency }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span [class]="product.stockQuantity <= product.minStockLevel ? 'text-red-600 font-medium' : ''">
                  {{ product.stockQuantity }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span [class]="getStatusClass(product.status)"
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ product.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  (click)="editProduct($event, product.id)"
                  class="text-blue-600 hover:text-blue-900 mr-3">
                  Edit
                </button>
                <button 
                  (click)="toggleProductStatus($event, product)"
                  [class]="product.status === 'Active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'">
                  {{ product.status === 'Active' ? 'Deactivate' : 'Activate' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="mt-6 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Showing {{ (currentPage - 1) * pageSize + 1 }} to 
          {{ Math.min(currentPage * pageSize, totalCount) }} of 
          {{ totalCount }} results
        </div>
        <div class="flex space-x-2">
          <ec-button 
            variant="outline" 
            size="sm"
            [disabled]="currentPage <= 1"
            (clicked)="previousPage()">
            Previous
          </ec-button>
          <ec-button 
            variant="outline" 
            size="sm"
            [disabled]="currentPage >= totalPages"
            (clicked)="nextPage()">
            Next
          </ec-button>
        </div>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  products$: Observable<Product[]>;
  categories$: Observable<Category[]>;
  
  viewMode: 'grid' | 'list' = 'grid';
  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';
  currentPage = 1;
  pageSize = 20;
  totalCount = 0;
  totalPages = 0;

  Math = Math;

  constructor(
    private productService: ProductService,
    private router: Router
  ) {
    this.products$ = this.productService.products$;
    this.categories$ = this.productService.categories$;
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.productService.loadProducts({
      page: this.currentPage,
      pageSize: this.pageSize,
      search: this.searchTerm || undefined,
      categoryId: this.selectedCategory || undefined,
      status: this.selectedStatus || undefined
    });
  }

  loadCategories(): void {
    this.productService.loadCategories();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onCategoryChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  createProduct(): void {
    this.router.navigate(['/products/new']);
  }

  viewProduct(id: string): void {
    this.router.navigate(['/products', id]);
  }

  editProduct(event: Event, id: string): void {
    event.stopPropagation();
    this.router.navigate(['/products', id, 'edit']);
  }

  toggleProductStatus(event: Event, product: Product): void {
    event.stopPropagation();
    const action = product.status === 'Active' ? 'deactivate' : 'activate';
    if (confirm(`${action} this product?`)) {
      this.productService.toggleProductStatus(product.id, action === 'activate')
        .subscribe(() => this.loadProducts());
    }
  }

  getStatusClass(status: string): string {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProducts();
    }
  }
}
