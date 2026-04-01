import React from 'react';
import { useLocation } from 'react-router-dom';

const appFaceMap = {
  Home: { id: 'solace', shellClass: 'from-[#050505] via-[#111111] to-[#050505]' },
  AllSpecialists: { id: 'solace', shellClass: 'from-[#050505] via-[#111111] to-[#050505]' },
  SpecialistChat: { id: 'solace', shellClass: 'from-[#050505] via-[#111111] to-[#050505]' },
  Chat: { id: 'oracle', shellClass: 'from-black via-amber-950 to-black' },
  VideoEditor: { id: 'luma', shellClass: 'from-[#1b0826] via-[#33104a] to-[#120612]' },
  MediaLibrary: { id: 'library', shellClass: 'from-[#061018] via-[#0d1320] to-[#05070b]' },
  Builder: { id: 'builder', shellClass: 'from-black via-[#24170a] to-black' },
  Inventor: { id: 'inventor', shellClass: 'from-black via-[#1f1026] to-black' },
  Mechanic: { id: 'mechanic', shellClass: 'from-black via-[#1c1c1c] to-black' },
  LiveVision: { id: 'vision', shellClass: 'from-black via-[#081c24] to-black' },
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  // Pages that should be full screen without layout wrapper
  const fullScreenPages = ['SplashLanding', 'SplashHome', 'SplashChat', 'SplashInterpreter', 'SplashSpecialists'];

  const searchParams = new URLSearchParams(location.search);
  const inheritedFace = searchParams.get('appFace');
  const pageFace = appFaceMap[currentPageName] || appFaceMap.Home;
  const resolvedFace = inheritedFace || pageFace.id;
  const resolvedFaceConfig = Object.values(appFaceMap).find(face => face.id === resolvedFace) || pageFace;
  
  if (fullScreenPages.includes(currentPageName)) {
    return <>{children}</>;
  }

  // Simple layout for other pages
  return (
    <div data-app-face={resolvedFace} className={`min-h-screen bg-gradient-to-br ${resolvedFaceConfig.shellClass}`}>
      <style>{`
        .privacy-mode [data-sensitive] {
          filter: blur(10px);
          pointer-events: none;
        }
        .privacy-mode .empire-credits,
        .privacy-mode .location-data,
        .privacy-mode .purchase-history {
          display: none !important;
        }
        [data-app-face="luma"] .app-face-accent {
          color: #f0abfc;
        }
        [data-app-face="oracle"] .app-face-accent {
          color: #fcd34d;
        }
        [data-app-face="builder"] .app-face-accent {
          color: #fb923c;
        }
        [data-app-face="inventor"] .app-face-accent {
          color: #c084fc;
        }
        [data-app-face="solace"] .app-face-accent,
        [data-app-face="library"] .app-face-accent,
        [data-app-face="vision"] .app-face-accent,
        [data-app-face="mechanic"] .app-face-accent {
          color: #fbbf24;
        }
      `}</style>
      {children}
    </div>
  );
}