import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export function formatDate(date: string): string {
  return format(new Date(date), 'dd MMM y', {
    locale: ptBR,
  });
}

export function formatDateHours(date: string): string {
  return format(new Date(date), "dd MMM y', às 'HH:mm", {
    locale: ptBR,
  });
}
