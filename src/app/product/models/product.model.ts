export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  status: 'Active' | 'Discontinued';
  stockQuantity: number;
  minStockLevel: number;
  price: number;
  currency: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  attributes: Record<string, string>;
  stockQuantity: number;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  parentCategoryId?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  sku: string;
  categoryId: string;
  price: number;
  currency: string;
  stockQuantity: number;
}

export interface UpdateProductRequest {
  name: string;
  description: string;
  categoryId: string;
}
