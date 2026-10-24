import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Column<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

interface Props<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  rowHref?: (row: T) => string | undefined;
}

export function DataTable<T>({ rows, columns, rowKey, emptyMessage, rowHref }: Props<T>) {
  if (!rows.length) {
    return (
      <div className="bg-cream border border-warm-grey/40 rounded-md p-12 text-center">
        <p className="text-umber/60 text-sm">{emptyMessage ?? 'No records yet.'}</p>
      </div>
    );
  }

  return (
    <div className="bg-cream border border-warm-grey/40 rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bg-orange border-b border-warm-grey/30">
            <tr>
              {columns.map((c, i) => (
                <th
                  key={i}
                  className={cn(
                    'text-left font-poppins text-[10px] uppercase tracking-tracked text-umber/60 px-4 py-3',
                    c.className,
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-grey/20">
            {rows.map((row) => {
              const href = rowHref?.(row);
              const cells = columns.map((c, i) => (
                <td key={i} className={cn('px-4 py-3 align-middle text-umber/85', c.className)}>
                  {c.cell(row)}
                </td>
              ));
              return href ? (
                <tr key={rowKey(row)} className="hover:bg-umber/[0.03] transition-colors group">
                  {columns.map((c, i) => (
                    <td key={i} className={cn('p-0', c.className)}>
                      <Link href={href} className="block px-4 py-3 text-umber/85">
                        {c.cell(row)}
                      </Link>
                    </td>
                  ))}
                </tr>
              ) : (
                <tr key={rowKey(row)} className="hover:bg-umber/[0.03] transition-colors">
                  {cells}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const isPublished = status === 'PUBLISHED';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[10px] font-poppins uppercase tracking-tracked-sm px-2 py-1 rounded-full',
        isPublished ? 'bg-green-100 text-green-900' : 'bg-warm-grey/30 text-umber/70',
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', isPublished ? 'bg-green-600' : 'bg-umber/40')} />
      {status}
    </span>
  );
}
