import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import Footer from './components/Footer'
import ProductDetail from './pages/ProductDetail'
import Shop from './pages/Shop'
import Wishlist from './pages/Wishlist'
import ErrorBoundary from './components/ErrorBoundary'
import ScrollToTop from './components/ScrollToTop'
import { Toaster } from 'react-hot-toast'
import NotFound from './pages/NotFound'
import OrderConfirmed from './pages/OrderConfirmed'
import Orders from './pages/Orders'




function App() {
  const { pathname } = useLocation()
  // Auth pages are full-screen standalone — no site navbar/footer.
  const hideChrome = pathname === '/login' || pathname === '/register'

  return (
    <>
      <Toaster
        toastOptions={{
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            border: '1px solid var(--toast-border)',
          },
        }}
      />
      <ScrollToTop />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-orange-500 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>

      {!hideChrome && <Navbar />}
      <ErrorBoundary>
      <main id="main-content" tabIndex={-1} className="flex-1">
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order-confirmed" element={<OrderConfirmed />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/login" element={<Login />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="*" element={<NotFound />} />

      </Routes>
      </main>
      </ErrorBoundary>
      {!hideChrome && <Footer />}
    </>
  )
}

export default App
