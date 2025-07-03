
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface UserSettings {
  profile: {
    name: string;
    email: string;
    timezone: string;
    accountType: string;
  };
  trading: {
    defaultLotSize: string;
    defaultRiskPercentage: string;
    defaultBias: string;
    preferredInstruments: string[];
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    tradingReminders: boolean;
    newsAlerts: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: string;
  };
  apiKeys: {
    finnhub: string;
    santiment: string;
    newsApi: string;
  };
}

export function useSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["settings"],
    queryFn: async (): Promise<UserSettings> => {
      const response = await fetch("/api/settings");
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      return response.json();
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: UserSettings) => {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save settings");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  return {
    settings,
    isLoading,
    error,
    saveSettings: saveSettingsMutation.mutateAsync,
    isSaving: saveSettingsMutation.isPending,
  };
}
