import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils/calculations";
import { getSessionLabel } from "@/lib/utils/session-detector";
import { useDeleteTrade } from "@/hooks/use-trades";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Trade } from "@shared/schema";

interface TradeTableProps {
  trades: Trade[];
  onEdit?: (trade: Trade) => void;
  onView?: (trade: Trade) => void;
}

type SortField = "entryDate" | "pnl" | "instrument";
type SortDirection = "asc" | "desc";

export default function TradeTable({ trades, onEdit, onView }: TradeTableProps) {
  const [sortField, setSortField] = useState<SortField>("entryDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const { toast } = useToast();
  const deleteTrade = useDeleteTrade();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedTrades = [...trades].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case "entryDate":
        aValue = new Date(a.entryDate);
        bValue = new Date(b.entryDate);
        break;
      case "pnl":
        aValue = parseFloat(a.pnl || "0");
        bValue = parseFloat(b.pnl || "0");
        break;
      case "instrument":
        aValue = a.instrument;
        bValue = b.instrument;
        break;
      default:
        return 0;
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this trade?")) {
      try {
        await deleteTrade.mutateAsync(id);
        toast({
          title: "Trade deleted",
          description: "The trade has been successfully deleted.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete trade. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="secondary" className="bg-warning/20 text-warning">Open</Badge>;
      case "closed":
        return <Badge variant="secondary" className="bg-profit/20 text-profit">Closed</Badge>;
      case "cancelled":
        return <Badge variant="secondary" className="bg-loss/20 text-loss">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDirectionBadge = (direction: string) => {
    const isLong = direction === "long";
    return (
      <Badge 
        variant="secondary" 
        className={cn(
          "text-xs",
          isLong ? "bg-profit/20 text-profit" : "bg-loss/20 text-loss"
        )}
      >
        {direction.toUpperCase()}
      </Badge>
    );
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-dark-300 hover:bg-dark-300/50">
            <TableHead className="text-gray-400">
              <Button
                variant="ghost"
                className="flex items-center p-0 text-gray-400 hover:text-white"
                onClick={() => handleSort("entryDate")}
              >
                Date
                <SortIcon field="entryDate" />
              </Button>
            </TableHead>
            <TableHead className="text-gray-400">
              <Button
                variant="ghost"
                className="flex items-center p-0 text-gray-400 hover:text-white"
                onClick={() => handleSort("instrument")}
              >
                Instrument
                <SortIcon field="instrument" />
              </Button>
            </TableHead>
            <TableHead className="text-gray-400">Session</TableHead>
            <TableHead className="text-gray-400">Direction</TableHead>
            <TableHead className="text-gray-400">Entry</TableHead>
            <TableHead className="text-gray-400">Exit</TableHead>
            <TableHead className="text-gray-400">
              <Button
                variant="ghost"
                className="flex items-center p-0 text-gray-400 hover:text-white"
                onClick={() => handleSort("pnl")}
              >
                P&L
                <SortIcon field="pnl" />
              </Button>
            </TableHead>
            <TableHead className="text-gray-400">Status</TableHead>
            <TableHead className="text-gray-400">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTrades.map((trade) => (
            <TableRow key={trade.id} className="border-dark-300 hover:bg-dark-300/50">
              <TableCell className="text-gray-300">
                {new Date(trade.entryDate).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-white font-medium">{trade.instrument}</TableCell>
              <TableCell className="text-gray-300">{getSessionLabel(trade.session)}</TableCell>
              <TableCell>{getDirectionBadge(trade.direction)}</TableCell>
              <TableCell className="text-gray-300">{formatCurrency(parseFloat(trade.entryPrice))}</TableCell>
              <TableCell className="text-gray-300">
                {trade.exitPrice ? formatCurrency(parseFloat(trade.exitPrice)) : "-"}
              </TableCell>
              <TableCell className={cn(
                "font-medium",
                parseFloat(trade.pnl || "0") >= 0 ? "text-profit" : "text-loss"
              )}>
                {trade.pnl ? formatCurrency(parseFloat(trade.pnl)) : "-"}
              </TableCell>
              <TableCell>{getStatusBadge(trade.status)}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView?.(trade)}
                    className="text-info hover:text-blue-400 p-1"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(trade)}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(trade.id)}
                    className="text-loss hover:text-red-400 p-1"
                    disabled={deleteTrade.isPending}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
