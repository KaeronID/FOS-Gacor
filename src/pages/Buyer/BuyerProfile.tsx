import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Save, Mail, Lock } from "lucide-react";
import { getUsers, saveUsers } from "@/utils/storage";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Layout/Navbar";
import ImageUpload from "@/components/ImageUpload";

const BuyerProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setProfileImage(user.profileImage || "");
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const users = getUsers();
      const updatedUsers = users.map((u) =>
        u.id === user.id ? { ...u, name: name.trim(), profileImage } : u
      );
      saveUsers(updatedUsers);
      updateUser({ ...user, name: name.trim(), profileImage });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch {
      toast({
        title: "Update Failed",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Validation Error",
        description: "All password fields are required",
        variant: "destructive",
      });
      return;
    }
    if (currentPassword !== user.password) {
      toast({
        title: "Validation Error",
        description: "Current password is incorrect",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Validation Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: "Validation Error",
        description: "New password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const users = getUsers();
      const updatedUsers = users.map((u) =>
        u.id === user.id ? { ...u, password: newPassword } : u
      );
      saveUsers(updatedUsers);
      updateUser({ ...user, password: newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully",
      });
    } catch {
      toast({
        title: "Update Failed",
        description: "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar showCart={false} />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-10">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            My Profile
          </h2>
          <p className="text-muted-foreground">
            Manage your personal information and account settings
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and profile picture
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold">
                      Profile Picture
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Upload a profile picture that represents you
                    </p>
                    <ImageUpload
                      currentImage={profileImage}
                      onImageSelect={setProfileImage}
                      className="w-32 h-32 rounded-full"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="email"
                          value={user?.email || ""}
                          disabled
                          className="pl-10 bg-muted"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Email address cannot be changed for security reasons
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleUpdateProfile} disabled={loading}>
                    {loading ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {[
                  {
                    id: "current-password",
                    label: "Current Password",
                    value: currentPassword,
                    set: setCurrentPassword,
                  },
                  {
                    id: "new-password",
                    label: "New Password",
                    value: newPassword,
                    set: setNewPassword,
                  },
                  {
                    id: "confirm-password",
                    label: "Confirm New Password",
                    value: confirmPassword,
                    set: setConfirmPassword,
                  },
                ].map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id={field.id}
                        type="password"
                        value={field.value}
                        onChange={(e) => field.set(e.target.value)}
                        placeholder={field.label}
                        className="pl-10"
                      />
                    </div>
                  </div>
                ))}

                <div className="flex justify-end">
                  <Button
                    onClick={handleChangePassword}
                    disabled={loading}
                    variant="outline"
                  >
                    {loading ? (
                      "Updating..."
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Preview */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Profile Preview</CardTitle>
                <CardDescription>
                  How your profile appears to others
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-24 h-24 bg-muted rounded-full overflow-hidden flex items-center justify-center">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">
                      {name || "Your Name"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                    <span className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      Student
                    </span>
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

export default BuyerProfile;
