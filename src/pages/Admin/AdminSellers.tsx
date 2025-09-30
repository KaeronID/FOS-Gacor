import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Search, Store, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { getUsers, saveUsers, getStores, getMenus } from '@/utils/storage';
import { User } from '@/types';

const AdminSellers: React.FC = () => {
  const [sellers, setSellers] = useState<User[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [stores, setStores] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const filtered = sellers.filter(seller => 
      seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSellers(filtered);
    setCurrentPage(1);
  }, [sellers, searchTerm]);

  const loadData = () => {
    const allUsers = getUsers();
    setSellers(allUsers.filter(user => user.role === 'seller'));
    setStores(getStores());
    setMenus(getMenus());
  };

  const totalPages = Math.ceil(filteredSellers.length / ITEMS_PER_PAGE);
  const currentSellers = filteredSellers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const toggleSellerStatus = (sellerId: string) => {
    const users = getUsers();
    const updatedUsers = users.map(user => 
      user.id === sellerId 
        ? { ...user, status: (user.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive' }
        : user
    );
    saveUsers(updatedUsers);
    loadData();
    
    const seller = users.find(u => u.id === sellerId);
    toast({
      title: 'Status Updated',
      description: `${seller?.name} is now ${seller?.status === 'active' ? 'inactive' : 'active'}`
    });
  };

  const getSellerStore = (sellerId: string) => {
    return stores.find(store => store.sellerId === sellerId);
  };

  const getSellerMenuCount = (sellerId: string) => {
    return menus.filter(menu => menu.sellerId === sellerId).length;
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Seller Management</h2>
          <p className="text-muted-foreground">Manage seller accounts and store status</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sellers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sellers</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sellers.filter(s => s.status !== 'inactive').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stores.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Menu Items</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menus.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sellers..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Sellers Table */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seller Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Store Name</TableHead>
                <TableHead>Menu Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentSellers.map((seller) => {
                const store = getSellerStore(seller.id);
                const menuCount = getSellerMenuCount(seller.id);
                return (
                  <TableRow key={seller.id}>
                    <TableCell className="font-medium">{seller.name}</TableCell>
                    <TableCell>{seller.email}</TableCell>
                    <TableCell>{store?.name || 'No Store'}</TableCell>
                    <TableCell>{menuCount}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(seller.status || 'active') as any}>
                        {seller.status || 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSellerStatus(seller.id)}
                          title={`${seller.status === 'active' ? 'Deactivate' : 'Activate'} seller`}
                        >
                          {seller.status === 'active' ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-red-600" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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

export default AdminSellers;