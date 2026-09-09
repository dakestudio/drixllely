import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WeddingProvider } from '@/context';
import { ErrorBoundary, LoadingSpinner, MusicPlayer, SectionDivider } from '@/components/ui';

// Lazy load section components for code splitting
const WelcomeScreen = React.lazy(() => import('@/components/sections/WelcomeScreen'));
const HeroSection = React.lazy(() => import('@/components/sections/HeroSection'));
const Countdown = React.lazy(() => import('@/components/sections/Countdown'));
const Gallery = React.lazy(() => import('@/components/sections/Gallery'));
const EventDetails = React.lazy(() => import('@/components/sections/EventDetails'));
const RSVPForm = React.lazy(() => import('@/components/sections/RSVPForm'));
const GiftSection = React.lazy(() => import('@/components/sections/GiftSection'));
const FinalMessage = React.lazy(() => import('@/components/sections/FinalMessage'));
const AdminPanel = React.lazy(() => import('@/components/admin/AdminPanel'));

/** Colores de fondo reales de cada sección — los divisores deben usarlos
 *  literalmente o se dibuja una banda de otro color entre secciones. */
const DARK = '#381031';  // Hero y FinalMessage
const CREAM = '#FCFBF5'; // Todas las secciones intermedias

/* El hero ocupa la pantalla completa mientras carga, así no hay salto
   de layout cuando aparece. */
const HeroFallback = () => (
  <div className="h-[100svh] w-full bg-[#381031]" aria-hidden="true" />
);

const Wedding = () => (
  <WeddingProvider>
    <main className="w-full min-h-screen relative font-sans text-wedding-lila selection:bg-wedding-olive selection:text-wedding-cream">
      <React.Suspense fallback={<LoadingSpinner />}>
        <WelcomeScreen />
      </React.Suspense>
      <MusicPlayer />

      {/* El hero tiene su propio límite de Suspense para pintar en cuanto
          llega su chunk, sin esperar al resto de las secciones. */}
      <React.Suspense fallback={<HeroFallback />}>
        <HeroSection />
      </React.Suspense>

      <React.Suspense fallback={null}>
        {/* Hero (oscuro) → Countdown (crema) */}
        <SectionDivider variant="elegant" fillTop={DARK} fillBottom={CREAM} />

        <Countdown />

        <SectionDivider variant="wave" fillTop={CREAM} fillBottom={CREAM} />

        <Gallery />

        <SectionDivider variant="curve" fillTop={CREAM} fillBottom={CREAM} />

        <EventDetails />

        <SectionDivider variant="elegant" fillTop={CREAM} fillBottom={CREAM} />

        <GiftSection />

        <SectionDivider variant="curve" fillTop={CREAM} fillBottom={CREAM} />

        <RSVPForm />

        {/* RSVP (crema) → Mensaje final (oscuro) */}
        <SectionDivider variant="elegant" fillTop={CREAM} fillBottom={DARK} />

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
          <Route
            path="/admin"
            element={
              <React.Suspense fallback={<LoadingSpinner />}>
                <AdminPanel />
              </React.Suspense>
            }
          />
          <Route path="*" element={<Wedding />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
