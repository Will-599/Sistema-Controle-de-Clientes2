export interface User {
  id: string;
  email: string;
  role: 'MasterAdmin' | 'TenantAdmin' | 'StaffUser';
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED';
  tenantId: string | null;
  createdAt?: string;
}

export interface Tenant {
  id: string;
  name: string;
  plan: string;
  subscriptionStatus: 'ACTIVE' | 'PENDING_PAYMENT' | 'SUSPENDED' | 'CANCELLED';
  createdAt: string;
  adminEmail?: string;
  userCount?: number;
  clientCount?: number;
  lastLogin?: string;
}

export interface AccessLog {
  id: string;
  userId: string;
  userEmail: string;
  ipAddress: string;
  tenantId: string | null;
  loginStatus: string;
  createdAt: string;
  tenantName?: string;
}

export interface Client {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  contractedService: string;
  notes: string;
  deleted?: number;
  deletedAt?: string;
  createdAt: string;
}

export interface Professional {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  role: string;
  createdAt: string;
}

export interface Task {
  id: string;
  clientId: string;
  clientName?: string;
  professionalId: string;
  professionalName?: string;
  tenantId: string;
  serviceName: string;
  date: string;
  time?: string;
  status: 'Pendente' | 'EmProgresso' | 'Concluido';
  notes: string;
  deleted?: number;
  deletedAt?: string;
  createdAt: string;
}
