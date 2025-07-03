import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Trade, InsertTrade, UpdateTrade } from "@shared/schema";
import type { TradeStats, TradeFilter } from "@/types/trade";

export function useTrades() {
  return useQuery<Trade[]>({
    queryKey: ["/api/trades"],
  });
}

export function useTradeStats() {
  return useQuery<TradeStats>({
    queryKey: ["/api/trades/stats"],
  });
}

export function useFilteredTrades(filter: TradeFilter) {
  return useQuery<Trade[]>({
    queryKey: ["/api/trades/filter", filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filter).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await fetch(`/api/trades/filter?${params}`);
      if (!response.ok) throw new Error("Failed to fetch filtered trades");
      return response.json();
    },
  });
}

export function useTrade(id: number) {
  return useQuery<Trade>({
    queryKey: ["/api/trades", id],
    queryFn: async () => {
      const response = await fetch(`/api/trades/${id}`);
      if (!response.ok) throw new Error("Failed to fetch trade");
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCreateTrade() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (trade: InsertTrade) => {
      const response = await apiRequest("POST", "/api/trades", trade);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trades/stats"] });
    },
  });
}

export function useUpdateTrade() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...trade }: UpdateTrade & { id: number }) => {
      const response = await apiRequest("PUT", `/api/trades/${id}`, trade);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trades/stats"] });
    },
  });
}

export function useDeleteTrade() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/trades/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trades/stats"] });
    },
  });
}
