
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  ChevronLeft,
  ArrowUpDown,
  Eye,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts/AppContext';
import { Product, SubscriptionTier } from '@/types';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import ProductForm, { ProductFormValues } from '@/components/ProductForm';

// API URL
const API_URL = 'http://localhost:5000/api';

const ProductManagementPage = () => {
  const navigate = useNavigate();
  const { userType, subscriptionTier, products, addProduct, updateProduct, deleteProduct } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Product | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);

  // Use subscription tier from context
  const sellerSubscription = subscriptionTier;
  
  const getProductLimit = (tier: SubscriptionTier) => {
    switch(tier) {
      case 'basic': return 10;
      case 'standard': return 50;
      case 'premium': return 'Unlimited';
      default: return 0;
    }
  };

  // Fetch products from the API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setLocalProducts(data);
      
      // Also update the context if needed
      if (data.length > 0 && addProduct) {
        data.forEach((product: Product) => {
          addProduct(product);
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Using local data instead.",
        variant: "destructive",
      });
      // Fallback to context products
      setLocalProducts(products || []);
    } finally {
      setLoading(false);
    }
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const productLimit = getProductLimit(sellerSubscription);
  const productCount = localProducts?.length || 0;
  const canAddMoreProducts = typeof productLimit === 'string' || productCount < productLimit;

  const handleAddProduct = async (formData: ProductFormValues) => {
    setSubmitting(true);
    
    try {
      // Prepare form data for API
      const formDataObj = new FormData();
      formDataObj.append('productData', JSON.stringify({
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        stock: formData.stock,
        deliveryOption: formData.deliveryOption,
        sellerId: 's5', // In a real app, this would be the current user's ID
      }));
      
      // If the image is a data URL (from file input), we need to convert it to a file
      if (formData.image && formData.image.startsWith('blob:')) {
        // Fetch the blob
        const response = await fetch(formData.image);
        const blob = await response.blob();
        
        // Create a File from the blob
        const file = new File([blob], 'product-image.jpg', { type: 'image/jpeg' });
        formDataObj.append('image', file);
      }
      
      // Send to API
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        body: formDataObj,
      });
      
      if (!response.ok) {
        throw new Error('Failed to add product');
      }
      
      const newProduct = await response.json();
      
      // Update local state
      setLocalProducts(prev => [...prev, newProduct]);
      
      // Update context
      if (addProduct) {
        addProduct(newProduct);
      }
      
      // Show success message
      toast({
        title: "Product added",
        description: `${formData.name} has been added to your product catalog.`,
      });
      
      // Close the dialog
      setShowProductDialog(false);
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductDialog(true);
  };

  const handleUpdateProduct = async (formData: ProductFormValues) => {
    if (!editingProduct) return;
    
    setSubmitting(true);
    
    try {
      // Prepare form data for API
      const formDataObj = new FormData();
      formDataObj.append('productData', JSON.stringify({
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        stock: formData.stock,
        deliveryOption: formData.deliveryOption,
      }));
      
      // If the image is a data URL (from file input), we need to convert it to a file
      if (formData.image && formData.image.startsWith('blob:')) {
        // Fetch the blob
        const response = await fetch(formData.image);
        const blob = await response.blob();
        
        // Create a File from the blob
        const file = new File([blob], 'product-image.jpg', { type: 'image/jpeg' });
        formDataObj.append('image', file);
      }
      
      // Send to API
      const response = await fetch(`${API_URL}/products/${editingProduct.id}`, {
        method: 'PUT',
        body: formDataObj,
      });
      
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      
      const updatedProduct = await response.json();
      
      // Update local state
      setLocalProducts(prev => 
        prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
      );
      
      // Update context
      if (updateProduct) {
        updateProduct(updatedProduct);
      }
      
      // Show success message
      toast({
        title: "Product updated",
        description: `${formData.name} has been updated.`,
      });
      
      // Close the dialog
      setShowProductDialog(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (product: Product) => {
    setDeletingProduct(product);
    setShowDeleteDialog(true);
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    
    try {
      // Send to API
      const response = await fetch(`${API_URL}/products/${deletingProduct.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      // Update local state
      setLocalProducts(prev => prev.filter(p => p.id !== deletingProduct.id));
      
      // Update context
      if (deleteProduct) {
        deleteProduct(deletingProduct.id);
      }
      
      // Show success message
      toast({
        title: "Product deleted",
        description: `${deletingProduct.name} has been removed from your catalog.`,
      });
      
      // Close the dialog
      setShowDeleteDialog(false);
      setDeletingProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewProduct = (productId: string) => {
    // Navigate to the product detail page
    navigate(`/products/${productId}`);
  };

  // Filter products based on search query
  const filteredProducts = localProducts?.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Sort products if a sort field is selected
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortField) return 0;
    
    if (sortField === 'price' || sortField === 'stock') {
      return sortDirection === 'asc' 
        ? a[sortField] - b[sortField]
        : b[sortField] - a[sortField];
    }
    
    if (sortField === 'name' || sortField === 'category') {
      return sortDirection === 'asc'
        ? a[sortField].localeCompare(b[sortField])
        : b[sortField].localeCompare(a[sortField]);
    }
    
    return 0;
  });

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'farm':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'groceries':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'handmade':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getDeliveryLabel = (option: string) => {
    switch (option) {
      case 'delivery': return 'Delivery';
      case 'pickup': return 'Pickup';
      case 'both': return 'Delivery & Pickup';
      default: return 'Unknown';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/seller/dashboard')}
            className="mr-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Product Management</h1>
            <p className="text-gray-600">Manage your product listings</p>
          </div>
        </div>
        <Button 
          onClick={() => {
            setEditingProduct(null);
            setShowProductDialog(true);
          }}
          className="mt-4 md:mt-0 bg-market-primary hover:bg-market-dark flex items-center gap-2"
          disabled={!canAddMoreProducts}
        >
          <PlusCircle className="h-5 w-5" />
          Add New Product
        </Button>
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct 
                ? 'Update your product information below.' 
                : 'Fill in the details to add a new product to your catalog.'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm 
            product={editingProduct || undefined}
            onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
            onCancel={() => {
              setShowProductDialog(false);
              setEditingProduct(null);
            }} 
            isSubmitting={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingProduct?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProduct}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product limit info */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Product Listings</h3>
                <div className="mt-1 flex items-baseline">
                  <div className="text-2xl font-semibold">{productCount}</div>
                  <div className="ml-2 text-sm text-gray-500">/ {productLimit}</div>
                </div>
              </div>
              {!canAddMoreProducts && (
                <div className="flex items-center text-orange-600 bg-orange-50 px-3 py-2 rounded-md">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>You've reached your product limit. <Button variant="link" className="p-0 h-auto text-market-primary" onClick={() => navigate('/subscription')}>Upgrade your plan</Button></span>
                </div>
              )}
            </div>
            <div className="mt-4 md:mt-0">
              <Badge variant="outline" className="text-market-primary border-market-primary">
                {sellerSubscription.charAt(0).toUpperCase() + sellerSubscription.slice(1)} Plan
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and filter */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Product table */}
      <Card>
        <CardContent className="p-0 overflow-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Image</TableHead>
                  <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                    <div className="flex items-center">
                      Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('price')} className="cursor-pointer">
                    <div className="flex items-center">
                      Price (KES)
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('stock')} className="cursor-pointer">
                    <div className="flex items-center">
                      Stock
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('category')} className="cursor-pointer">
                    <div className="flex items-center">
                      Category
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Delivery Option</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProducts.length > 0 ? (
                  sortedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-12 h-12 object-cover rounded-md"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>KES {product.price.toLocaleString()}</TableCell>
                      <TableCell>
                        {product.stock > 10 ? (
                          <span className="text-green-600">{product.stock}</span>
                        ) : product.stock > 0 ? (
                          <span className="text-orange-500">{product.stock} (Low)</span>
                        ) : (
                          <span className="text-red-600">Out of Stock</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryBadgeClass(product.category)}>
                          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{getDeliveryLabel(product.deliveryOption)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewProduct(product.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => confirmDelete(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No products found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductManagementPage;
