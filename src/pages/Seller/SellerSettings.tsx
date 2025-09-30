import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Settings, Moon, Sun, Bell, Shield, Palette, Store } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Layout/Navbar';

const SellerSettings: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [reviewNotifications, setReviewNotifications] = useState(true);
  const [storeStatus, setStoreStatus] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedNotifications = localStorage.getItem('notifications') !== 'false';
    const savedOrderNotifications = localStorage.getItem('orderNotifications') !== 'false';
    const savedReviewNotifications = localStorage.getItem('reviewNotifications') !== 'false';
    const savedStoreStatus = localStorage.getItem('storeStatus') !== 'false';
    const savedSoundEffects = localStorage.getItem('soundEffects') === 'true';

    setDarkMode(savedDarkMode);
    setNotifications(savedNotifications);
    setOrderNotifications(savedOrderNotifications);
    setReviewNotifications(savedReviewNotifications);
    setStoreStatus(savedStoreStatus);
    setSoundEffects(savedSoundEffects);

    // Apply dark mode
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    localStorage.setItem('darkMode', enabled.toString());
    
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    toast({
      title: enabled ? 'Dark Mode Enabled' : 'Light Mode Enabled',
      description: 'Theme preference has been saved',
    });
  };

  const handleSettingToggle = (type: string, enabled: boolean) => {
    localStorage.setItem(type, enabled.toString());
    
    switch (type) {
      case 'notifications':
        setNotifications(enabled);
        break;
      case 'orderNotifications':
        setOrderNotifications(enabled);
        break;
      case 'reviewNotifications':
        setReviewNotifications(enabled);
        break;
      case 'storeStatus':
        setStoreStatus(enabled);
        break;
      case 'soundEffects':
        setSoundEffects(enabled);
        break;
    }

    toast({
      title: 'Settings Updated',
      description: 'Your preferences have been saved',
    });
  };

  const resetSettings = () => {
    setDarkMode(false);
    setNotifications(true);
    setOrderNotifications(true);
    setReviewNotifications(true);
    setStoreStatus(true);
    setSoundEffects(false);

    // Clear localStorage
    localStorage.removeItem('darkMode');
    localStorage.removeItem('notifications');
    localStorage.removeItem('orderNotifications');
    localStorage.removeItem('reviewNotifications');
    localStorage.removeItem('storeStatus');
    localStorage.removeItem('soundEffects');

    // Reset theme
    document.documentElement.classList.remove('dark');

    toast({
      title: 'Settings Reset',
      description: 'All settings have been reset to default values',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar showCart={false} />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 flex items-center">
            <Settings className="h-8 w-8 mr-3 text-primary" />
            Seller Settings
          </h2>
          <p className="text-muted-foreground">
            Manage your store preferences and app settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Store Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="h-5 w-5 mr-2" />
                Store Settings
              </CardTitle>
              <CardDescription>
                Configure your store operation preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Store Status
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Accept new orders and remain visible to customers
                  </p>
                </div>
                <Switch
                  checked={storeStatus}
                  onCheckedChange={(checked) => handleSettingToggle('storeStatus', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how the app looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium flex items-center">
                    {darkMode ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
                    Dark Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={handleDarkModeToggle}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </CardTitle>
              <CardDescription>
                Control what notifications you receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about app updates and activities
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={(checked) => handleSettingToggle('notifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    New Orders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you receive new orders
                  </p>
                </div>
                <Switch
                  checked={orderNotifications}
                  onCheckedChange={(checked) => handleSettingToggle('orderNotifications', checked)}
                  disabled={!notifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    New Reviews
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about new customer reviews
                  </p>
                </div>
                <Switch
                  checked={reviewNotifications}
                  onCheckedChange={(checked) => handleSettingToggle('reviewNotifications', checked)}
                  disabled={!notifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Sound Effects
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Play sounds for notifications and new orders
                  </p>
                </div>
                <Switch
                  checked={soundEffects}
                  onCheckedChange={(checked) => handleSettingToggle('soundEffects', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Manage your privacy and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Business Data Protection</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your store information, sales data, and customer interactions are encrypted and stored securely. We comply with data protection regulations to keep your business safe.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>
                  For more details about how we handle your business data, please read our{' '}
                  <Button variant="link" className="p-0 h-auto text-primary">
                    Seller Privacy Policy
                  </Button>
                  {' '}and{' '}
                  <Button variant="link" className="p-0 h-auto text-primary">
                    Terms of Service
                  </Button>
                  .
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Reset Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Reset Settings</CardTitle>
              <CardDescription>
                Reset all settings to their default values
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    This will reset all your preferences to the default settings
                  </p>
                </div>
                <Button variant="outline" onClick={resetSettings}>
                  Reset All Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SellerSettings;