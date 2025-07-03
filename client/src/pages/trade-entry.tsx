import { useParams } from "wouter";
import TradeForm from "@/components/forms/trade-form";
import { useTrade } from "@/hooks/use-trades";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function TradeEntry() {
  const params = useParams();
  const tradeId = params.id ? parseInt(params.id) : undefined;
  const { data: trade, isLoading, error } = useTrade(tradeId || 0);

  if (tradeId && isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-6" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tradeId && error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-white">Trade Not Found</h1>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              The trade you're looking for doesn't exist or has been deleted.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {trade ? "Edit Trade" : "New Trade Entry"}
        </h2>
      </div>
      
      <TradeForm trade={trade} />
    </div>
  );
}
