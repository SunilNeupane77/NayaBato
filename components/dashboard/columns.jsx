
import { StatusBadge } from './StatusBadge';
import { IssueActions } from './IssueActions';

export const columns = (onStatusChange) => [
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'createdAt',
    header: 'Reported On',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: 'actions',
    cell: ({ row }) => <IssueActions issue={row.original} onStatusChange={onStatusChange} />,
  },
];
