import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WeddingProvider } from '@/context';
import { ErrorBoundary, LoadingSpinner, MusicPlayer, SectionDivider } from '@/components/ui';

// Lazy load section components for code splitting
const WelcomeScreen = React.lazy(() => import('@/components/sections/WelcomeScreen'));
const HeroSection = React.lazy(() => import('@/components/sections/HeroSection'));
const Countdown = React.lazy(() => import('@/components/sections/Countdown'));
// Historia eliminada por completo
const Gallery = React.lazy(() => import('@/components/sections/Gallery'));
const EventDetails = React.lazy(() => import('@/components/sections/EventDetails'));
const RSVPForm = React.lazy(() => import('@/components/sections/RSVPForm'));
const GiftSection = React.lazy(() => import('@/components/sections/GiftSection'));
const FinalMessage = React.lazy(() => import('@/components/sections/FinalMessage'));
const AdminPanel = React.lazy(() => import('@/components/admin/AdminPanel'));

// Wedding Invitation Page
const WeddingPage = () => (
  <WeddingProvider>
    <main className="w-full min-h-screen relative font-sans text-wedding-charcoal selection:bg-wedding-gold selection:text-white">
      <React.Suspense fallback={<LoadingSpinner />}>
        <WelcomeScreen />
      </React.Suspense>
      <MusicPlayer />

      {/* Main Content */}
      <React.Suspense fallback={<div className="h-screen flex items-center justify-center">Cargando...</div>}>
        
        <HeroSection />

        {/* Hero → Countdown: oscuro a beige */}
        <SectionDivider variant="elegant" fillTop="#2B1A2A" fillBottom="#FFFF" />

        <Countdown />

        {/* Countdown → Galería: beige a blanco (Este es el filtro exacto que tenía la Historia) */}
        <SectionDivider variant="wave" fillTop="#A8ABAE" fillBottom="#FFFFFF" />

        <Gallery />

        {/* Galería → Detalles del evento: blanco a beige */}
        <SectionDivider variant="curve" fillTop="#FFFFFF" fillBottom="#A8ABAE" />

        <EventDetails />

        {/* Detalles del evento → Regalos: beige con beige */}
        <SectionDivider variant="elegant" fillTop="#A8ABAE" fillBottom="#F5F5F0" />

        <GiftSection />

        {/* Regalos → Confirmar asistencia (RSVP): pasa de beige a blanco */}
        <SectionDivider variant="curve" fillTop="#A8ABAE" fillBottom="#FFFFFF" />

        <RSVPForm />

        {/* RSVP → Mensaje Final: pasa de blanco a oscuro */}
        <SectionDivider variant="elegant" fillTop="#FFFFFF" fillBottom="#2B1A2A" />

        <FinalMessage />

      </React.Suspense>
    </main>
  </WeddingProvider>
);

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={
            <React.Suspense fallback={<div className="h-screen flex items-center justify-center">Cargando...</div>}>
              <AdminPanel />
            </React.Suspense>
          } />
          <Route path="*" element={<WeddingPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;