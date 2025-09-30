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
import { Store, Save, Upload, MapPin } from "lucide-react";
import { getStores, saveStores } from "@/utils/storage";
import { Store as StoreType } from "@/types";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Layout/Navbar";
import ImageUpload from "@/components/ImageUpload";

const SellerProfile: React.FC = () => {
  const { user } = useAuth();
  const [store, setStore] = useState<StoreType | null>(null);
  const [storeName, setStoreName] = useState("");
  const [storeLocation, setStoreLocation] = useState("");
  const [storeImage, setStoreImage] = useState("");
  const [qrisImage, setQrisImage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const stores = getStores();
      const existingStore = stores.find((s) => s.sellerId === user.id);
      if (existingStore) {
        setStore(existingStore);
        setStoreName(existingStore.name);
        setStoreLocation(existingStore.location || "");
        setStoreImage(existingStore.image || "");
        setQrisImage(existingStore.qrisImage || "");
      } else {
        // Initialize with user name
        setStoreName(user.name);
      }
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    if (!storeName.trim()) {
      toast({
        title: "Validation Error",
        description: "Store name is required",
        variant: "destructive",
      });
      return;
    }

    if (!storeLocation.trim()) {
      toast({
        title: "Validation Error",
        description: "Store location is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const stores = getStores();
      const updatedStore: StoreType = {
        id: store?.id || Date.now().toString(),
        sellerId: user.id,
        name: storeName.trim(),
        location: storeLocation.trim(),
        image: storeImage,
        qrisImage: qrisImage,
        createdAt: store?.createdAt || new Date().toISOString(),
      };

      if (store) {
        // Update existing store
        const updatedStores = stores.map((s) =>
          s.id === store.id ? updatedStore : s
        );
        saveStores(updatedStores);
      } else {
        // Create new store
        stores.push(updatedStore);
        saveStores(stores);
      }

      setStore(updatedStore);

      toast({
        title: "Profile Updated",
        description: "Your store profile has been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update store profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar showCart={false} />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 flex items-center">
            <Store className="h-8 w-8 mr-3 text-primary" />
            Shop Profile
          </h2>
          <p className="text-muted-foreground">
            Manage your store information and settings
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Store Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Store Information</CardTitle>
                <CardDescription>
                  Update your store details that customers will see
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input
                    id="store-name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Enter your store name"
                  />
                  <p className="text-xs text-muted-foreground">
                    This is how your store will appear to customers
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-location">Store Location</Label>
                  <Input
                    id="store-location"
                    value={storeLocation}
                    onChange={(e) => setStoreLocation(e.target.value)}
                    placeholder="Enter your store address"
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide your store's physical location for customers
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">
                      Store Image
                    </Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload an image that represents your store
                    </p>
                    <ImageUpload
                      currentImage={storeImage}
                      onImageSelect={setStoreImage}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-semibold">
                      QRIS Payment Image
                    </Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload your QRIS code for digital payments
                    </p>
                    <ImageUpload
                      currentImage={qrisImage}
                      onImageSelect={setQrisImage}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="min-w-32"
                  >
                    {loading ? (
                      <>Saving...</>
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
          </div>

          {/* Store Preview */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Store Preview</CardTitle>
                <CardDescription>
                  How your store appears to customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    {storeImage ? (
                      <img
                        src={storeImage}
                        alt="Store"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No store image
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">
                      {storeName || "Your Store Name"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Seller: {user?.name}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {storeLocation || "Location not set"}
                    </p>
                  </div>

                  {qrisImage && (
                    <div>
                      <h4 className="font-medium mb-2">Payment Options:</h4>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-success rounded flex items-center justify-center">
                          <span className="text-xs text-success-foreground font-bold">
                            Q
                          </span>
                        </div>
                        <span className="text-sm">QRIS Available</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Store Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Profile Complete:</span>
                    <span className="text-sm font-medium">
                      {storeName && storeLocation && storeImage && qrisImage
                        ? "100%"
                        : storeName &&
                          storeLocation &&
                          (storeImage || qrisImage)
                        ? "75%"
                        : storeName && storeLocation
                        ? "50%"
                        : "25%"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Payment Methods:</span>
                    <span className="text-sm font-medium">
                      {qrisImage ? "Cash + QRIS" : "Cash Only"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Store Status:</span>
                    <span className="text-sm font-medium text-success">
                      Active
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

export default SellerProfile;
