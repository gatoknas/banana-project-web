export interface Category {
  id: number;
  name: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  categoryId?: number;
  description: string;
  image?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: 'ayurami-admin' | 'ayurami-salesperson' | 'Administrador' | 'Vendedor' | 'Cliente' | string;
  status: 'Activo' | 'Inactivo' | string;
  avatar?: string;
}

export interface Session {
  token: string;
  user: User;
}

export type ViewState = 'login' | 'dashboard' | 'products' | 'users' | 'proveedores' | 'compras';

export interface Supplier {
  id: number;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  taxId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierRequest {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  taxId: string;
}

export interface DailyRevenueBucket {
  date: string;
  amount: number;
  count: number;
}

export interface RevenueSummary {
  totalRevenue: number;
  transactionCount: number;
  averageTicket: number;
  previousPeriodRevenue: number;
  growthPercentage: number;
  currency: string;
  timeline: DailyRevenueBucket[];
}

export interface EmailReceipt {
  id: number;
  messageId: string;
  sender: string;
  subject: string;
  receivedAt: string;
  transactionDate?: string;
  amount?: number;
  currency: string;
  payer?: string;
  bank?: string;
  reference?: string;
  transactionNumber?: string;
  paymentMethod?: string;
  status: string;
  parseError?: string;
  createdAt: string;
}

export type RevenuePeriod = 'today' | '7d' | '30d' | 'year';

