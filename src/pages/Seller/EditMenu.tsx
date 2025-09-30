import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Package, ArrowLeft, Upload, Save } from "lucide-react";
import { getMenuById, getMenus, saveMenus } from "@/utils/storage";
import { Menu } from "@/types";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Layout/Navbar";
import ImageUpload from "@/components/ImageUpload";

interface FormDataState {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
  image: string;
}

const EditMenu: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "0",
    image: "",
  });

  useEffect(() => {
    if (!id) {
      navigate("/seller");
      return;
    }
    if (!user) return;

    const menuData = getMenuById(id);
    if (!menuData) {
      toast({
        title: "Menu Not Found",
        description: "The requested menu item could not be found.",
        variant: "destructive",
      });
      navigate("/seller");
      return;
    }

    if (menuData.sellerId && user && menuData.sellerId !== user.id) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to edit this menu.",
        variant: "destructive",
      });
      navigate("/seller");
      return;
    }

    setMenu(menuData as Menu);
    setFormData({
      name: menuData.name || "",
      description: menuData.description || "",
      price: menuData.price != null ? String(menuData.price) : "",
      category: menuData.category || "",
      stock:
        (menuData as any).stock != null ? String((menuData as any).stock) : "0",
      image: menuData.image || "",
    });
  }, [id, user, navigate]);

  const handleInputChange = (field: keyof FormDataState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData((prev) => ({ ...prev, image: imageUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.category
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }
    if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      toast({
        title: "Invalid Stock",
        description: "Please enter a valid stock",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const allMenus = getMenus();
      const updatedMenus = allMenus.map((m) =>
        m.id === id
          ? {
              ...m,
              name: formData.name,
              description: formData.description,
              price: Number(formData.price),
              category: formData.category,
              stock: Number(formData.stock),
              image: formData.image,
            }
          : m
      );
      saveMenus(updatedMenus);

      toast({
        title: "Menu Updated",
        description: "Your menu item has been updated successfully",
      });
      navigate("/seller");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update menu item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Kurangi stok otomatis saat ada pesanan
  const handleOrder = () => {
    if (!menu) return;
    if (Number(formData.stock) <= 0) {
      toast({
        title: "Out of Stock",
        description: "This item is not available anymore",
        variant: "destructive",
      });
      return;
    }

    const newStock = Number(formData.stock) - 1;
    setFormData((prev) => ({ ...prev, stock: String(newStock) }));

    const allMenus = getMenus();
    const updatedMenus = allMenus.map((m) =>
      m.id === id ? { ...m, stock: newStock } : m
    );
    saveMenus(updatedMenus);

    toast({
      title: "Order Placed",
      description: "Stock has been reduced by 1",
    });
  };

  const categories = [
    "Main Course",
    "Appetizer",
    "Beverages",
    "Dessert",
    "Snacks",
    "Salad",
  ];

  if (!menu) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar showCart={false} />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/2 mb-6"></div>
            <div className="h-64 bg-muted rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar showCart={false} />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/seller")}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-primary" /> Edit Menu
                  Item
                </CardTitle>
                <CardDescription>Perbarui detail menu Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Menu Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={3}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (IDR) *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="1000"
                        value={formData.price}
                        onChange={(e) =>
                          handleInputChange("price", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock *</Label>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        step="1"
                        value={formData.stock}
                        onChange={(e) =>
                          handleInputChange("stock", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          handleInputChange("category", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Menu Image</Label>
                    <ImageUpload
                      onImageSelect={handleImageUpload}
                      currentImage={formData.image}
                    />
                  </div>
                  <div className="flex justify-end space-x-4 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/seller")}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        "Updating..."
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" /> Update Menu Item
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  How your menu item will appear
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt="Menu preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {formData.name || "Menu Name"}
                    </h3>
                    {formData.category && (
                      <Badge variant="secondary" className="mt-1">
                        {formData.category}
                      </Badge>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      {formData.description ||
                        "Menu description will appear here..."}
                    </p>
                    <p className="text-lg font-bold text-primary mt-2">
                      {formData.price
                        ? `IDR ${Number(formData.price).toLocaleString(
                            "id-ID"
                          )}`
                        : "IDR 0"}
                    </p>
                    <p className="text-sm mt-1">
                      Stock: {formData.stock || "0"}
                    </p>
                  </div>
                  {(menu as any).ingredients &&
                    (menu as any).ingredients.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Ingredients:</h4>
                        <div className="text-sm text-muted-foreground">
                          {(menu as any).ingredients
                            .map((ing: any) => ing.ingredientName || ing.name)
                            .join(", ")}
                        </div>
                      </div>
                    )}
                  <div className="pt-4">
                    <Button onClick={handleOrder} className="w-full">
                      Place Order (Reduce Stock)
                    </Button>
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

export default EditMenu;
