import { CitySection } from '../components/CitySection';
import { HeroSection } from '../components/HeroSection';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import { StepsSection } from '../components/StepsSection';

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <HeroSection />
      <StepsSection />
      <CitySection />
      <SiteFooter />
    </main>
  );
}
