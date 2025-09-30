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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Save, Package, Minus, X, Clock } from "lucide-react";
import {
  getMenus,
  saveMenus,
  getIngredients,
  getStores,
} from "@/utils/storage";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Layout/Navbar";
import ImageUpload from "@/components/ImageUpload";
import { useNavigate } from "react-router-dom";

interface IngredientUsage {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
}

const AddMenu: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [prepTime, setPrepTime] = useState(""); // NEW: Estimated preparation time in minutes
  const [ingredients, setIngredients] = useState<IngredientUsage[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<any[]>([]);
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);

  const categories = [
    "Main Course",
    "Appetizer",
    "Beverages",
    "Dessert",
    "Salad",
    "Soup",
    "Snacks",
  ];

  useEffect(() => {
    if (user) {
      const userIngredients = getIngredients().filter(
        (ing) => ing.sellerId === user.id
      );
      setAvailableIngredients(userIngredients);

      const stores = getStores();
      const userStore = stores.find((s) => s.sellerId === user.id);
      setStoreName(userStore?.name || user.name);
    }
  }, [user]);

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { ingredientId: "", ingredientName: "", quantity: 0 },
    ]);
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const updated = [...ingredients];
    if (field === "ingredientId") {
      const ingredient = availableIngredients.find((ing) => ing.id === value);
      if (ingredient) {
        updated[index] = {
          ...updated[index],
          ingredientId: value,
          ingredientName: ingredient.name,
        };
      }
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
    }
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validation
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Menu name is required",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Validation Error",
        description: "Description is required",
        variant: "destructive",
      });
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      toast({
        title: "Validation Error",
        description: "Valid price is required",
        variant: "destructive",
      });
      return;
    }

    if (!stock || parseInt(stock) < 0) {
      toast({
        title: "Validation Error",
        description: "Valid stock is required",
        variant: "destructive",
      });
      return;
    }

    if (!category) {
      toast({
        title: "Validation Error",
        description: "Category is required",
        variant: "destructive",
      });
      return;
    }

    if (!prepTime || parseInt(prepTime) <= 0) {
      toast({
        title: "Validation Error",
        description: "Valid preparation time is required",
        variant: "destructive",
      });
      return;
    }

    if (ingredients.some((ing) => !ing.ingredientId || ing.quantity <= 0)) {
      toast({
        title: "Validation Error",
        description:
          "All ingredients must have a valid selection and quantity > 0",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const menus = getMenus();
      const newMenu = {
        id: Date.now().toString(),
        sellerId: user.id,
        storeName,
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        stock: parseInt(stock),
        image: image || `https://picsum.photos/400/300?random=${Date.now()}`,
        category,
        prepTime: parseInt(prepTime), // NEW: Save preparation time
        ingredients: ingredients.filter(
          (ing) => ing.ingredientId && ing.quantity > 0
        ),
        rating: 0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
      };

      menus.push(newMenu);
      saveMenus(menus);

      toast({
        title: "Menu Added Successfully",
        description: "Your new menu item has been added",
      });

      navigate("/seller");
    } catch (error) {
      toast({
        title: "Failed to Add Menu",
        description: "There was an error adding your menu item",
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
            <Plus className="h-8 w-8 mr-3 text-primary" />
            Add New Menu Item
          </h2>
          <p className="text-muted-foreground">
            Create a new menu item for your store
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Menu Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Menu Information</CardTitle>
                <CardDescription>
                  Fill in the details for your new menu item
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">
                      Menu Image
                    </Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload an appetizing photo of your dish
                    </p>
                    <ImageUpload
                      currentImage={image}
                      onImageSelect={setImage}
                      className="w-full aspect-video"
                    />
                  </div>

                  <Separator />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Menu Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Nasi Ayam Bakar"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your dish..."
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (IDR)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g., 15000"
                        min="0"
                        step="1000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="e.g., 20"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prepTime">
                      Estimated Preparation Time (minutes)
                    </Label>
                    <Input
                      id="prepTime"
                      type="number"
                      value={prepTime}
                      onChange={(e) => setPrepTime(e.target.value)}
                      placeholder="e.g., 15"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>

                <Separator />

                {/* Ingredients Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold">
                        Ingredients
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Add ingredients used in this menu item
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addIngredient}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Ingredient
                    </Button>
                  </div>

                  {ingredients.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p>No ingredients added yet</p>
                      <p className="text-sm">Click "Add Ingredient" to start</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ingredients.map((ingredient, index) => (
                        <Card key={index} className="p-4">
                          <div className="grid gap-3 md:grid-cols-3 items-center">
                            <div className="space-y-2">
                              <Label>Ingredient</Label>
                              <Select
                                value={ingredient.ingredientId}
                                onValueChange={(value) =>
                                  updateIngredient(index, "ingredientId", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select ingredient" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableIngredients.map((ing) => (
                                    <SelectItem key={ing.id} value={ing.id}>
                                      {ing.name} ({ing.stock} {ing.unit})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Quantity Used</Label>
                              <div className="flex items-center space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    updateIngredient(
                                      index,
                                      "quantity",
                                      Math.max(0, ingredient.quantity - 0.1)
                                    )
                                  }
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Input
                                  type="number"
                                  value={ingredient.quantity}
                                  onChange={(e) =>
                                    updateIngredient(
                                      index,
                                      "quantity",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  step="0.1"
                                  min="0"
                                  className="text-center"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    updateIngredient(
                                      index,
                                      "quantity",
                                      ingredient.quantity + 0.1
                                    )
                                  }
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="flex justify-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeIngredient(index)}
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button variant="outline" onClick={() => navigate("/seller")}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="min-w-32"
                  >
                    {loading ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Add Menu Item
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
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
                    {image ? (
                      <img
                        src={image}
                        alt="Menu preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">
                      {name || "Menu Name"}
                    </h3>
                    {category && (
                      <Badge variant="secondary" className="mt-1">
                        {category}
                      </Badge>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      {description || "Menu description will appear here..."}
                    </p>
                    <p className="text-lg font-bold text-primary mt-2">
                      {price
                        ? `IDR ${parseFloat(price).toLocaleString("id-ID")}`
                        : "IDR 0"}
                    </p>
                    <p className="text-sm mt-1">Stock: {stock || 0}</p>
                    <p className="text-sm flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      Prep Time: {prepTime || 0} minutes
                    </p>
                  </div>

                  {ingredients.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Ingredients:</h4>
                      <div className="text-sm text-muted-foreground">
                        {ingredients
                          .filter(
                            (ing) => ing.ingredientName && ing.quantity > 0
                          )
                          .map(
                            (ing) => `${ing.ingredientName} (${ing.quantity})`
                          )
                          .join(", ") || "No ingredients selected"}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMenu;
