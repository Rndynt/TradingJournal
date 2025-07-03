import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Bell, 
  Shield, 
  Database, 
  Download, 
  Upload,
  Key,
  Clock,
  DollarSign,
  Trash2,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings, type UserSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { toast } = useToast();
  const { settings: serverSettings, isLoading, saveSettings, isSaving } = useSettings();
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    if (serverSettings) {
      setSettings(serverSettings);
    }
  }, [serverSettings]);

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      await saveSettings(settings);
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  const handleExportData = () => {
    // Simulasi export data
    const dataToExport = {
      settings,
      exportDate: new Date().toISOString(),
      version: "1.0"
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { 
      type: "application/json" 
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tradepro-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Your settings have been exported successfully.",
    });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (importedData.settings) {
          setSettings(importedData.settings);
          toast({
            title: "Data Imported",
            description: "Settings have been imported successfully.",
          });
        }
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid file format. Please select a valid settings file.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast({
        title: "Account Deletion",
        description: "Account deletion request has been submitted. You will receive a confirmation email.",
        variant: "destructive",
      });
    }
  };

  const updateSettings = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold text-white">Settings</h2>

      {/* Profile Settings */}
      <Card className="bg-dark-200 border-dark-300">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-info" />
            <CardTitle className="text-white">Profile Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-400">Full Name</Label>
              <Input
                value={settings.profile.name}
                onChange={(e) => updateSettings('profile', 'name', e.target.value)}
                className="bg-dark-300 border-dark-400 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-400">Email Address</Label>
              <Input
                value={settings.profile.email}
                onChange={(e) => updateSettings('profile', 'email', e.target.value)}
                className="bg-dark-300 border-dark-400 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-400">Timezone</Label>
              <Select 
                value={settings.profile.timezone}
                onValueChange={(value) => updateSettings('profile', 'timezone', value)}
              >
                <SelectTrigger className="bg-dark-300 border-dark-400 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-dark-300 border-dark-400">
                  <SelectItem value="GMT+7">GMT+7 (Jakarta)</SelectItem>
                  <SelectItem value="GMT+0">GMT+0 (London)</SelectItem>
                  <SelectItem value="GMT-5">GMT-5 (New York)</SelectItem>
                  <SelectItem value="GMT+9">GMT+9 (Tokyo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-400">Account Type</Label>
              <div className="mt-2">
                <Badge className="bg-profit text-white">
                  {settings.profile.accountType}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Preferences */}
      <Card className="bg-dark-200 border-dark-300">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-profit" />
            <CardTitle className="text-white">Trading Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-400">Default Lot Size</Label>
              <Input
                value={settings.trading.defaultLotSize}
                onChange={(e) => updateSettings('trading', 'defaultLotSize', e.target.value)}
                type="number"
                step="0.01"
                className="bg-dark-300 border-dark-400 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-400">Default Risk %</Label>
              <Input
                value={settings.trading.defaultRiskPercentage}
                onChange={(e) => updateSettings('trading', 'defaultRiskPercentage', e.target.value)}
                type="number"
                step="0.1"
                className="bg-dark-300 border-dark-400 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-400">Default Market Bias</Label>
              <Select 
                value={settings.trading.defaultBias}
                onValueChange={(value) => updateSettings('trading', 'defaultBias', value)}
              >
                <SelectTrigger className="bg-dark-300 border-dark-400 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-dark-300 border-dark-400">
                  <SelectItem value="bull">Bullish</SelectItem>
                  <SelectItem value="bear">Bearish</SelectItem>
                  <SelectItem value="sideways">Sideways</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-gray-400">Preferred Instruments</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {["XAUUSD", "BTCUSD", "ETHUSD"].map((instrument) => (
                <Badge
                  key={instrument}
                  variant={settings.trading.preferredInstruments.includes(instrument) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer",
                    settings.trading.preferredInstruments.includes(instrument)
                      ? "bg-info text-white"
                      : "border-gray-600 text-gray-400 hover:bg-dark-300"
                  )}
                  onClick={() => {
                    const newInstruments = settings.trading.preferredInstruments.includes(instrument)
                      ? settings.trading.preferredInstruments.filter(i => i !== instrument)
                      : [...settings.trading.preferredInstruments, instrument];
                    updateSettings('trading', 'preferredInstruments', newInstruments);
                  }}
                >
                  {instrument}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-dark-200 border-dark-300">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-warning" />
            <CardTitle className="text-white">Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <Label className="text-gray-300 capitalize">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </Label>
              <Switch
                checked={value}
                onCheckedChange={(checked) => updateSettings('notifications', key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-dark-200 border-dark-300">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-loss" />
            <CardTitle className="text-white">Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-gray-300">Two-Factor Authentication</Label>
            <Switch
              checked={settings.security.twoFactorEnabled}
              onCheckedChange={(checked) => updateSettings('security', 'twoFactorEnabled', checked)}
            />
          </div>
          <div>
            <Label className="text-gray-400">Session Timeout (minutes)</Label>
            <Select 
              value={settings.security.sessionTimeout}
              onValueChange={(value) => updateSettings('security', 'sessionTimeout', value)}
            >
              <SelectTrigger className="bg-dark-300 border-dark-400 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-300 border-dark-400">
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="480">8 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card className="bg-dark-200 border-dark-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-info" />
              <CardTitle className="text-white">API Keys Management</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowApiKeys(!showApiKeys)}
              className="text-gray-400 hover:text-white"
            >
              {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(settings.apiKeys).map(([key, value]) => (
            <div key={key}>
              <Label className="text-gray-400 capitalize">{key} API Key</Label>
              <Input
                value={value}
                onChange={(e) => updateSettings('apiKeys', key, e.target.value)}
                type={showApiKeys ? "text" : "password"}
                placeholder={`Enter your ${key} API key`}
                className="bg-dark-300 border-dark-400 text-white"
              />
            </div>
          ))}
          <div className="text-sm text-gray-500">
            <p>API keys are used to fetch real-time market data and news. They are stored securely and only used for authorized requests.</p>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-dark-200 border-dark-300">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-warning" />
            <CardTitle className="text-white">Data Management</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleExportData}
              className="bg-dark-300 text-white hover:bg-dark-400"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Settings
            </Button>
            
            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
                id="import-settings"
              />
              <Button
                onClick={() => document.getElementById('import-settings')?.click()}
                className="bg-dark-300 text-white hover:bg-dark-400"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Settings
              </Button>
            </div>
          </div>
          
          <Separator className="bg-dark-400" />
          
          <div>
            <h4 className="text-white font-medium mb-2">Danger Zone</h4>
            <Button
              onClick={handleDeleteAccount}
              variant="destructive"
              className="bg-loss hover:bg-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              This action will permanently delete your account and all associated data. This cannot be undone.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-profit text-white hover:bg-green-600"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save All Settings"
          )}
        </Button>
      </div>
    </div>
  );
}