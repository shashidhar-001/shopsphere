import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import HomePage          from './pages/HomePage'
import AuthPage          from './pages/AuthPage'
import ProductsPage      from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"             element={<HomePage />} />
          <Route path="/login"        element={<AuthPage />} />
          <Route path="/products"     element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App