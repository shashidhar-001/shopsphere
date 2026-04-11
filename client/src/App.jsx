import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'   // ← ADD
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'        // ← ADD
import CheckoutPage from './pages/CheckoutPage'   // ← ADD
import AdminDashboard from './pages/AdminDashboard'  // ← ADD
import { ProductProvider } from './context/ProductContext'  // ← ADD
import OrdersPage from './pages/OrdersPage'   // ← ADD
import { WishlistProvider } from './context/WishlistContext'
import WishlistPage from './pages/WishlistPage'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ProductProvider>
          <WishlistProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
        </ProductProvider>
      </CartProvider>
    </AuthProvider >
  )
}

export default App