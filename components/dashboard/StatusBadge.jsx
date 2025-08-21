
import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS } from './constants';

export const StatusBadge = ({ status }) => {
  const statusInfo = STATUS_COLORS[status] || { label: 'Unknown', color: 'bg-gray-500' };
  return (
    <Badge className={`${statusInfo.color} text-white`}>
      {statusInfo.label}
    </Badge>
  );
};
