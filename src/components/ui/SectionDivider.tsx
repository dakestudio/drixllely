import React from 'react';

type DividerVariant = 'wave' | 'curve' | 'elegant';

interface SectionDividerProps {
  variant?: DividerVariant;
  fillTop?: string;
  fillBottom?: string;
  flip?: boolean;
}

const paths: Record<DividerVariant, string> = {
  wave: 'M0,64 C320,128 640,0 960,64 C1280,128 1600,0 1920,64 L1920,192 L0,192 Z',
  curve: 'M0,128 Q480,0 960,64 Q1440,128 1920,32 L1920,192 L0,192 Z',
  elegant: 'M0,96 C240,160 480,32 720,96 C960,160 1200,32 1440,96 C1680,160 1920,96 1920,96 L1920,192 L0,192 Z',
};

const SectionDivider: React.FC<SectionDividerProps> = ({
  variant = 'wave',
  fillTop = '#FCFBF5',
  fillBottom = '#FCFBF5',
  flip = false,
}) => {
  return (
    <div
      className={`relative w-full overflow-hidden leading-[0] ${flip ? 'rotate-180' : ''}`}
      style={{ marginTop: '-1px', marginBottom: '-1px' }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1920 192"
        preserveAspectRatio="none"
        className="w-full h-[60px] md:h-[80px] lg:h-[100px]"
        fill="none"
      >
        {/* Background fill - should match the TOP section color because the path draws the BOTTOM section color */}
        <rect width="1920" height="192" fill={fillTop} />
        {/* Wave shape - draws the bottom part, so it should be filled with the BOTTOM section color */}
        <path d={paths[variant]} fill={fillBottom} />
      </svg>
    </div>
  );
};

export default SectionDivider;
