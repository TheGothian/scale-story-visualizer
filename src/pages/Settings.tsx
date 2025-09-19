import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Scale, User, Bell, Shield, Palette } from "lucide-react";
import { useUnit } from "@/contexts/UnitContext";
import { HamburgerMenu } from "@/components/HamburgerMenu";

const UserSettings: React.FC = () => {
  const { unitSystem, setUnitSystem } = useUnit();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <HamburgerMenu />

      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              User Settings
            </h1>
            <p className="text-gray-600">
              Manage your preferences and account settings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unit System Settings */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Scale className="h-5 w-5" />
                  Unit System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Choose your preferred unit system for weights and measurements
                </p>
                <ToggleGroup
                  type="single"
                  value={unitSystem}
                  onValueChange={(value) =>
                    value && setUnitSystem(value as "metric" | "imperial")
                  }
                  className="justify-start"
                >
                  <ToggleGroupItem value="metric" aria-label="Metric system">
                    Metric (kg)
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="imperial"
                    aria-label="Imperial system"
                  >
                    Imperial (lbs)
                  </ToggleGroupItem>
                </ToggleGroup>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <User className="h-5 w-5" />
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Manage your account information and authentication
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Authentication</span>
                    <span className="text-xs text-gray-500">Authelia OIDC</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Account Status</span>
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Configure your notification preferences
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Goal Reminders</span>
                    <span className="text-xs text-gray-500">Coming Soon</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">
                      Progress Updates
                    </span>
                    <span className="text-xs text-gray-500">Coming Soon</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Shield className="h-5 w-5" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Manage your data privacy and security settings
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Data Export</span>
                    <span className="text-xs text-gray-500">Coming Soon</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">
                      Account Deletion
                    </span>
                    <span className="text-xs text-gray-500">Contact Admin</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Settings */}
          <div className="mt-8">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Customize the appearance of your dashboard
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Theme</span>
                    <span className="text-xs text-gray-500">Light Mode</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Chart Colors</span>
                    <span className="text-xs text-gray-500">Default</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
