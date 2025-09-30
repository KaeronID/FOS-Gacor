import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Search, Plus, Edit, Trash2, Megaphone, Eye, Calendar } from 'lucide-react';
import { getBanners, saveBanners } from '@/utils/storage';
import { Banner } from '@/types';

const AdminPromotions: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [filteredBanners, setFilteredBanners] = useState<Banner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    active: true,
    startDate: '',
    endDate: ''
  });

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadBanners();
  }, []);

  useEffect(() => {
    const filtered = banners.filter(banner => 
      banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      banner.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBanners(filtered);
    setCurrentPage(1);
  }, [banners, searchTerm]);

  const loadBanners = () => {
    setBanners(getBanners());
  };

  const totalPages = Math.ceil(filteredBanners.length / ITEMS_PER_PAGE);
  const currentBanners = filteredBanners.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const banners = getBanners();
    
    if (editingBanner) {
      // Update existing banner
      const updatedBanners = banners.map(banner => 
        banner.id === editingBanner.id 
          ? { 
              ...banner, 
              title: formData.title,
              description: formData.description,
              image: formData.image,
              active: formData.active,
              startDate: formData.startDate,
              endDate: formData.endDate,
              updatedAt: new Date().toISOString()
            }
          : banner
      );
      saveBanners(updatedBanners);
      setBanners(updatedBanners);
      toast({
        title: 'Success',
        description: 'Banner updated successfully'
      });
    } else {
      // Create new banner
      const newBanner: Banner = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        image: formData.image || `https://picsum.photos/800/300?random=${Date.now()}`,
        active: formData.active,
        startDate: formData.startDate,
        endDate: formData.endDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedBanners = [...banners, newBanner];
      saveBanners(updatedBanners);
      setBanners(updatedBanners);
      toast({
        title: 'Success',
        description: 'Banner created successfully'
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description,
      image: banner.image,
      active: banner.active,
      startDate: banner.startDate || '',
      endDate: banner.endDate || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (bannerId: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      const banners = getBanners();
      const updatedBanners = banners.filter(banner => banner.id !== bannerId);
      saveBanners(updatedBanners);
      setBanners(updatedBanners);
      toast({
        title: 'Success',
        description: 'Banner deleted successfully'
      });
    }
  };

  const toggleBannerStatus = (bannerId: string) => {
    const banners = getBanners();
    const updatedBanners = banners.map(banner => 
      banner.id === bannerId 
        ? { ...banner, active: !banner.active, updatedAt: new Date().toISOString() }
        : banner
    );
    saveBanners(updatedBanners);
    setBanners(updatedBanners);
    
    const banner = banners.find(b => b.id === bannerId);
    toast({
      title: 'Status Updated',
      description: `Banner is now ${banner?.active ? 'inactive' : 'active'}`
    });
  };

  const resetForm = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      description: '',
      image: '',
      active: true,
      startDate: '',
      endDate: ''
    });
  };

  const getStatusColor = (active: boolean) => {
    return active ? 'success' : 'destructive';
  };

  const isDateActive = (banner: Banner) => {
    const now = new Date();
    const start = banner.startDate ? new Date(banner.startDate) : null;
    const end = banner.endDate ? new Date(banner.endDate) : null;
    
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Promotion Management</h2>
          <p className="text-muted-foreground">Manage promotional banners and campaigns</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
              <DialogDescription>
                {editingBanner ? 'Update banner information' : 'Create a new promotional banner'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL (optional)</Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date (optional)</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                />
                <Label htmlFor="active">Active</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingBanner ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Banners</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{banners.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Banners</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {banners.filter(b => b.active && isDateActive(b)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {banners.filter(b => b.startDate && new Date(b.startDate) > new Date()).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {banners.filter(b => b.endDate && new Date(b.endDate) < new Date()).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search banners..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Banners Table */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banner</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentBanners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-16 h-10 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{banner.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {banner.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(banner.active && isDateActive(banner)) as any}>
                      {banner.active && isDateActive(banner) ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {banner.startDate && (
                        <p>From: {new Date(banner.startDate).toLocaleDateString()}</p>
                      )}
                      {banner.endDate && (
                        <p>To: {new Date(banner.endDate).toLocaleDateString()}</p>
                      )}
                      {!banner.startDate && !banner.endDate && (
                        <p className="text-muted-foreground">No schedule</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(banner.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleBannerStatus(banner.id)}
                      >
                        {banner.active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(banner)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(banner.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
              className="w-10"
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminPromotions;