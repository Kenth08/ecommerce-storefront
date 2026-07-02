import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import Footer from './components/Footer'
import ProductDetail from './pages/ProductDetail'
import ErrorBoundary from './components/ErrorBoundary'
import { Toaster } from 'react-hot-toast'
import NotFound from './pages/NotFound'




function App() {
  return (
    <>
      <Toaster />

      <Navbar />
      <ErrorBoundary>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="*" element={<NotFound />} />

      </Routes>
      </ErrorBoundary>
      <Footer />
    </>
  )
}

export default App
