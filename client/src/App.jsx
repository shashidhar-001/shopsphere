import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'   // ← ADD
import HomePage          from './pages/HomePage'
import AuthPage          from './pages/AuthPage'
import ProductsPage      from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage          from './pages/CartPage'        // ← ADD

function App() {
  return (
    <AuthProvider>
      <CartProvider>                                    {/* ← ADD */}
        <BrowserRouter>
          <Routes>
            <Route path="/"             element={<HomePage />} />
            <Route path="/login"        element={<AuthPage />} />
            <Route path="/products"     element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart"         element={<CartPage />} />   {/* ← ADD */}
          </Routes>
        </BrowserRouter>
      </CartProvider>                                   {/* ← ADD */}
    </AuthProvider>
  )
}

export default App