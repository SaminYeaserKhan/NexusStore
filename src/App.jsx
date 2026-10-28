// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useTransform, useSpring } from "framer-motion";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Shop from "./pages/Shop"; // Import the new page
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Cart from "./pages/Cart";
import Success from "./pages/Success";
import Dashboard from "./pages/Dashboard";
import ProductDetails from "./pages/ProductDetails";
import SeedData from "./pages/SeedData";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import Chatbot from "./components/Chatbot";
import MobileSearch from "./components/MobileSearch";
import MobileViewWrapper from "./components/MobileViewWrapper";
import LavaLampBackground from "./components/LavaLampBackground";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { MobileViewProvider, useMobileView } from "./context/MobileViewContext";
import { ThemeProvider } from "./context/ThemeContext";

// Inner component to access mobile view context
const AppContent = () => {
  const { isMobileViewEnabled, isActualMobile } = useMobileView();
  const showMobileSearch = isMobileViewEnabled && !isActualMobile;
  const location = useLocation();

  const PageTransition = ({ children }) => {
    const { scrollYProgress } = useScroll();
    const smoothProgress = useSpring(scrollYProgress, {
      stiffness: 80,
      damping: 20,
      mass: 0.4,
    });
    const scrollLift = useTransform(smoothProgress, [0, 1], [0, -24]);
    const scrollScale = useTransform(smoothProgress, [0, 1], [1, 0.992]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -18, scale: 0.995 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div style={{ y: scrollLift, scale: scrollScale }}>
          {children}
        </motion.div>
      </motion.div>
    );
  };

  return (
    <MobileViewWrapper>
      <LavaLampBackground />
      <div className="min-h-screen transition-colors duration-300 font-sans mobile-content relative z-10">
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Home is now the Landing Page */}
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            
            {/* Shop is the Discover/Filter Page */}
            <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
            
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/admin" element={<PageTransition><AdminRoute><Admin /></AdminRoute></PageTransition>} />
            <Route path="/cart" element={<PageTransition><PrivateRoute><Cart /></PrivateRoute></PageTransition>} />
            <Route path="/success" element={<PageTransition><PrivateRoute><Success /></PrivateRoute></PageTransition>} />
            <Route path="/dashboard" element={<PageTransition><PrivateRoute><Dashboard /></PrivateRoute></PageTransition>} />
            <Route path="/product/:id" element={<PageTransition><ProductDetails /></PageTransition>} />
            <Route path="/seed" element={<PageTransition><AdminRoute><SeedData /></AdminRoute></PageTransition>} />
          </Routes>
        </AnimatePresence>
        <Chatbot />
        {showMobileSearch && <MobileSearch />}
      </div>
    </MobileViewWrapper>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <MobileViewProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </MobileViewProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;