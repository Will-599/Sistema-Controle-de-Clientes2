import { useState, useEffect, useCallback } from 'react';
import { ActivityLog } from '../types';

export function useActivityLog(token: string | null) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');
  const [days, setDays] = useState('7'); // default 7 days
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (entityType) params.append('entityType', entityType);
      if (action) params.append('action', action);
      if (days) params.append('days', days);
      
      const res = await fetch(`/api/activity-log?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [token, entityType, action, days]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const oldV = log.oldValue?.toLowerCase() || '';
    const newV = log.newValue?.toLowerCase() || '';
    const email = log.userEmail?.toLowerCase() || '';
    return oldV.includes(q) || newV.includes(q) || email.includes(q) || log.entityId.toLowerCase().includes(q);
  });

  const exportCSV = () => {
    const headers = ['Data', 'Utilizador', 'Entidade', 'ID Entidade', 'Ação', 'Valor Antigo', 'Valor Novo'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + '\n'
      + filteredLogs.map(log => {
        const date = new Date(log.timestamp).toLocaleString('pt-PT');
        return `"${date}","${log.userEmail || log.userId}","${log.entityType}","${log.entityId}","${log.action}","${(log.oldValue || '').replace(/"/g, '""')}","${(log.newValue || '').replace(/"/g, '""')}"`;
      }).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `historico_atividades_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return { logs: filteredLogs, loading, entityType, setEntityType, action, setAction, days, setDays, searchQuery, setSearchQuery, refetch: fetchLogs, exportCSV };
}
