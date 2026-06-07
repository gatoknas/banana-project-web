export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  description: string;
  image?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Vendedor' | 'Cliente';
  status: 'Activo' | 'Inactivo';
  avatar?: string;
}

export interface Session {
  token: string;
  user: User;
}

export type ViewState = 'login' | 'dashboard' | 'products' | 'users';
