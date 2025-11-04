'use client';

import React from 'react';

const BackgroundDecoration: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="gradient-bg" />
      <style jsx>{`
        .gradient-bg {
          width: 100%;
          height: 100%;
          background: linear-gradient(
            -45deg,
            rgba(238, 130, 238, 0.08),
            rgba(147, 197, 253, 0.08),
            rgba(251, 191, 36, 0.08),
            rgba(167, 139, 250, 0.08)
          );
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default BackgroundDecoration;