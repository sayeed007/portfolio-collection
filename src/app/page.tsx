// src/app/page.tsx
import BackgroundDecoration from '@/components/common/BackgroundDecoration';
// import { HomePageContent } from '@/components/home/HomePageContent';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background decoration */}
      <BackgroundDecoration />

      <div className="relative z-10">
        {/* <HomePageContent /> */}
      </div>
    </div>
  );
}