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
  status: 'Pendente' | 'EmProgresso' | 'Concluido' | 'Aguardando início' | 'Em andamento' | 'Em revisão' | 'Concluído' | 'Cancelado';
  priority?: 'baixa' | 'média' | 'alta' | 'urgente';
  notes: string;
  deleted?: number;
  deletedAt?: string;
  createdAt: string;
}

export interface MetricsData {
  totalClients: number;
  newClientsThisMonth: number;
  tasksPending: number;
  tasksInProgress: number;
  tasksCompleted: number;
  recentClients: Client[];
  tasksByStatus: { status: string; count: number }[];
  clientsGrowth: { month: string; count: number }[];
}

export interface ActivityLog {
  id: string;
  tenantId: string;
  entityType: 'CLIENTE' | 'SERVIÇO' | 'SISTEMA';
  entityId: string;
  action: 'CRIOU' | 'EDITOU' | 'APAGOU' | 'MUDOU_STATUS' | 'COMENTOU';
  oldValue?: string;
  newValue?: string;
  userId: string;
  userEmail?: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  tenantId: string;
  type: 'PRAZO_PROXIMO' | 'PRAZO_ATRASADO' | 'NOVO_SERVICO' | 'STATUS_ALTERADO' | 'CLIENTE_INATIVO';
  title: string;
  message: string;
  entityType?: 'CLIENTE' | 'SERVIÇO';
  entityId?: string;
  read: number; // 0 ou 1
  createdAt: string;
}
