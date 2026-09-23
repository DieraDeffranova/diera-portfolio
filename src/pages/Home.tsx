import Hero from '../components/Hero';
import FeaturedWork from '../components/FeaturedWork';
import Services from '../components/Services';
import About from '../components/About';
import Tools from '../components/Tools';
import Profiles from '../components/Profiles';
import Contact from '../components/Contact';

export default function Home({ onOpenProject }: { onOpenProject: (slug: string) => void }) {
  return (
    <main id="main">
      <Hero />
      <FeaturedWork onOpen={onOpenProject} />
      <Services />
      <About />
      <Tools />
      <Profiles />
      <Contact />
    </main>
  );
}
