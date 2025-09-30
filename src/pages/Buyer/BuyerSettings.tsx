import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Settings, Moon, Sun, Bell, Shield, Palette } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Layout/Navbar';

const BuyerSettings: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedNotifications = localStorage.getItem('notifications') !== 'false';
    const savedOrderUpdates = localStorage.getItem('orderUpdates') !== 'false';
    const savedPromotions = localStorage.getItem('promotions') !== 'false';
    const savedSoundEffects = localStorage.getItem('soundEffects') === 'true';

    setDarkMode(savedDarkMode);
    setNotifications(savedNotifications);
    setOrderUpdates(savedOrderUpdates);
    setPromotions(savedPromotions);
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

  const handleNotificationToggle = (type: string, enabled: boolean) => {
    localStorage.setItem(type, enabled.toString());
    
    switch (type) {
      case 'notifications':
        setNotifications(enabled);
        break;
      case 'orderUpdates':
        setOrderUpdates(enabled);
        break;
      case 'promotions':
        setPromotions(enabled);
        break;
      case 'soundEffects':
        setSoundEffects(enabled);
        break;
    }

    toast({
      title: 'Settings Updated',
      description: 'Your notification preferences have been saved',
    });
  };

  const resetSettings = () => {
    setDarkMode(false);
    setNotifications(true);
    setOrderUpdates(true);
    setPromotions(true);
    setSoundEffects(false);

    // Clear localStorage
    localStorage.removeItem('darkMode');
    localStorage.removeItem('notifications');
    localStorage.removeItem('orderUpdates');
    localStorage.removeItem('promotions');
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
            Settings
          </h2>
          <p className="text-muted-foreground">
            Customize your app experience and preferences
          </p>
        </div>

        <div className="space-y-6">
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
                  onCheckedChange={(checked) => handleNotificationToggle('notifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Order Updates
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about order status changes
                  </p>
                </div>
                <Switch
                  checked={orderUpdates}
                  onCheckedChange={(checked) => handleNotificationToggle('orderUpdates', checked)}
                  disabled={!notifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Promotions & Offers
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about special deals and promotions
                  </p>
                </div>
                <Switch
                  checked={promotions}
                  onCheckedChange={(checked) => handleNotificationToggle('promotions', checked)}
                  disabled={!notifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    Sound Effects
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Play sounds for notifications and interactions
                  </p>
                </div>
                <Switch
                  checked={soundEffects}
                  onCheckedChange={(checked) => handleNotificationToggle('soundEffects', checked)}
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
                    <h4 className="font-medium">Data Protection</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your personal information is encrypted and stored securely. We never share your data with third parties without your consent.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>
                  For more details about how we handle your data, please read our{' '}
                  <Button variant="link" className="p-0 h-auto text-primary">
                    Privacy Policy
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

export default BuyerSettings;