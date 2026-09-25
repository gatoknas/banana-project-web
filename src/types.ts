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
  unitOfMeasureId?: number;
  unitName?: string;
  unitAbbreviation?: string;
  currentStock?: number;
  minimumStock?: number;
  averageCost?: number;
}

export interface UnitOfMeasure {
  id: number;
  name: string;
  abbreviation: string;
  unitType: string;
  createdAt?: string;
}

export interface PurchaseDetail {
  id: number;
  purchaseId: number;
  productId: number;
  productName?: string;
  purchaseUnitId?: number;
  purchaseUnitName?: string;
  purchaseUnitAbbreviation?: string;
  quantityPurchased: number;
  conversionFactor: number;
  baseQuantity: number;
  unitCost: number;
  subtotal: number;
  createdAt?: string;
}

export interface Purchase {
  id: number;
  supplierId: number;
  supplierName?: string;
  invoiceNumber: string;
  purchaseDate: string;
  totalAmount: number;
  notes?: string;
  createdAt?: string;
  details?: PurchaseDetail[];
}

export interface PurchaseItemRequest {
  productId: number;
  purchaseUnitId?: number;
  quantityPurchased: number;
  conversionFactor: number;
  unitCost: number;
}

export interface PurchaseRequest {
  supplierId: number;
  invoiceNumber: string;
  purchaseDate: string;
  notes?: string;
  items: PurchaseItemRequest[];
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

export type ViewState = 'login' | 'dashboard' | 'products' | 'users' | 'proveedores' | 'compras' | 'ventas';

export interface Supplier {
  id: number;
  companyName: string;
  contactName?: string;
  phone: string;
  email?: string;
  taxId?: string | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierRequest {
  companyName: string;
  contactName?: string;
  phone: string;
  email?: string;
  taxId?: string | null;
  description?: string | null;
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

export interface SaleDetail {
  id: number;
  saleId: number;
  productId: number;
  productName?: string;
  quantity: number;
  historicalUnitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  userId: number;
  userName?: string;
  saleDate: string;
  totalAmount: number;
  paymentMethod: string;
  itemsCount?: number;
  createdAt?: string;
  details?: SaleDetail[];
}

export interface SalePagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface SaleSummaryStats {
  totalAmount: number;
  totalCount: number;
}

export interface PaginatedSalesResponse {
  data: Sale[];
  pagination: SalePagination;
  summary: SaleSummaryStats;
}

export interface SaleFilter {
  page?: number;
  pageSize?: number;
  fromDate?: string;
  toDate?: string;
  paymentMethod?: string;
  userId?: number;
}

export interface DashboardKPIs {
  todayRevenue: number;
  todayTransactions: number;
  averageTicket: number;
  lowStockProducts: number;
  monthPurchasesTotal: number;
  activeUsers: number;
}

export interface SalesTimelineEntry {
  date: string;
  revenue: number;
  count: number;
}

export interface PaymentMethodEntry {
  method: string;
  count: number;
  amount: number;
}

export interface TopProductEntry {
  productId: number;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface CategoryEntry {
  categoryId: number;
  categoryName: string;
  totalRevenue: number;
  count: number;
}

export interface PurchasesVsSalesEntry {
  month: string;
  purchases: number;
  sales: number;
}

export interface InventoryAlertEntry {
  productId: number;
  productName: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
}

export interface DashboardStats {
  kpis: DashboardKPIs;
  salesTimeline: SalesTimelineEntry[];
  paymentMethodBreakdown: PaymentMethodEntry[];
  topProducts: TopProductEntry[];
  categoryBreakdown: CategoryEntry[];
  purchasesVsSales: PurchasesVsSalesEntry[];
  inventoryAlerts: InventoryAlertEntry[];
}


