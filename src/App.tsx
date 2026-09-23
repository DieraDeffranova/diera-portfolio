import { MotionConfig } from 'framer-motion';
import { StartProjectProvider } from './context/StartProjectContext';
import { I18nProvider, useI18n } from './i18n';
import { useProjectRoute } from './hooks/useProjectRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Project from './pages/Project';
import Footer from './components/Footer';
import StartProject from './components/StartProject';
import CustomCursor from './components/CustomCursor';
import AmbientBackground from './components/AmbientBackground';
import EasterEgg from './components/EasterEgg';

function Site() {
  const { slug, openProject, closeProject } = useProjectRoute();
  const { t } = useI18n();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:bg-sand-100 focus:px-4 focus:py-2 focus:text-ink-950"
      >
        {t.common.skip}
      </a>
      <AmbientBackground />
      <Navbar />
      <Home onOpenProject={openProject} />
      <Footer />
      <Project slug={slug} onClose={closeProject} onOpen={openProject} />
      <StartProject />
      <EasterEgg />
      <div aria-hidden="true" className="grain pointer-events-none fixed inset-0 z-[70]" />
      <CustomCursor />
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <I18nProvider>
        <StartProjectProvider>
          <Site />
        </StartProjectProvider>
      </I18nProvider>
    </MotionConfig>
  );
}
