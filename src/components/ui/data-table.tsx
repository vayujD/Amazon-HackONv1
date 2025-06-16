
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DataTableProps {
  title: string;
  columns: string[];
  data: any[];
  className?: string;
}

export function DataTable({ title, columns, data, className }: DataTableProps) {
  const getRiskBadgeColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return 'bg-danger text-white';
      case 'medium':
        return 'bg-warning text-white';
      case 'low':
        return 'bg-success text-white';
      default:
        return 'bg-muted';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'flagged':
      case 'violation':
        return 'bg-danger text-white';
      case 'verified':
      case 'active':
        return 'bg-success text-white';
      case 'pending':
        return 'bg-warning text-white';
      default:
        return 'bg-muted';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => {
                  const value = row[column.toLowerCase().replace(/\s+/g, '')];
                  
                  // Special rendering for risk scores and status badges
                  if (column.toLowerCase().includes('risk')) {
                    return (
                      <TableCell key={column}>
                        <Badge className={getRiskBadgeColor(value)}>
                          {value}
                        </Badge>
                      </TableCell>
                    );
                  }
                  
                  if (column.toLowerCase().includes('status') || column.toLowerCase().includes('verified')) {
                    return (
                      <TableCell key={column}>
                        <Badge className={getStatusBadgeColor(value)}>
                          {value}
                        </Badge>
                      </TableCell>
                    );
                  }
                  
                  return (
                    <TableCell key={column}>
                      {value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
