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


function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ProductProvider>                    {/* ← ADD */}
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />   {/* ← ADD */}
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/admin" element={<AdminDashboard />} />

            </Routes>
          </BrowserRouter>
        </ProductProvider>                   {/* ← ADD */}

      </CartProvider>                                   {/* ← ADD */}
    </AuthProvider>
  )
}

export default App