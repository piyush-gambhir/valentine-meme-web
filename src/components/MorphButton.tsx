import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ==========================================
// TYPES & CONSTANTS
// ==========================================

type Mood = 'love' | 'hopeful' | 'worried' | 'crying' | 'dead';
type Stage = 'intro' | 'playful' | 'persuasion' | 'chaos' | 'boss';
type NoMode =
  | 'button'
  | 'split'
  | 'fake'
  | 'loading'
  | 'slider'
  | 'checkbox'
  | 'link'
  | 'draggable';
type EndingStyle = 'romantic' | 'corporate' | 'dramatic' | 'absurd' | 'anime';

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

// Stage thresholds
const STAGES = {
  playful: 2,
  persuasion: 6,
  chaos: 10,
  boss: 15,
};

// ==========================================
// COPY DATA - All 40 copywriting variations
// ==========================================

const NOPE_COPY = [
  'No 😐',
  'Are you sure? 🤨',
  'Really sure?? 😟',
  'Pls think again 🥺',
  'Are you REALLY sure? 😰',
  'This is making me sad 😢',
  "You're hurting teddy 😭",
  "I'm literally sobbing rn 😭😭",
  'My heart just cracked 💔',
  "FINE I'll ask nicely... PLS? 🙏",
  "I'll give u my fries 🍟",
  'AND my dessert 🍰',
  "I'll learn to cook for u 👨‍🍳",
  'OK this is my last try... 😤',
  "You're breaking the law 💼",
  'Valentine Policy violation ⚖️',
  'System Error: NO not found 💻',
  'This option is closed 🔒',
  'N0 (corrupted) 🔤',
  'Nah (fading) 👻',
  'Nope (almost gone) 🌫️',
  '... (silence) 🌑',
  'There is no No. Only Yes. ✨',
  'No.exe has stopped working 💥',
  "Can't click what doesn't exist 🎭",
  'Error 418: Not a valid choice 🫖',
  'By clicking No you agree to Yes 📜',
] as const;

const YEP_COPY = [
  'Yes! 💖',
  'Yes! 💖',
  'Yes!! 💕',
  'YES!! 💗',
  'YES!!! 💓',
  'YESSS! 💝',
  'SAY YES 💘',
  'CLICK ME 💖',
  'YESSS!! 💕💕',
  'RIGHT HERE 👉💖👈',
  'PLS PLS PLS 🥺💖',
  'YESSSSS 💖💖💖',
  'JUST DO IT 💖✨',
  'CLICK MEEEE 🫵💖',
  'OBVIOUSLY YES 💖',
  'CORRECT ANSWER 💖',
  'THE ONLY CHOICE 💖',
  'YES YES YES 💖',
  'DO IT FOR TEDDY 🧸💖',
  'ACCEPTANCE IS KEY 🔑💖',
  'EMBRACE DESTINY ✨💖',
  'YES OR ELSE 😤💖',
] as const;

const SUBTITLE_COPY = [
  '',
  'Think about it... 🤔',
  'Teddy is watching 👀',
  'The universe disagrees 🌌',
  '404: Valid reason not found',
  'Success rate: 0% 📉',
  'Yes success rate: 100% 📈',
  'Blocked by Valentine Policy 🚫',
  'Achievement: Persistent 🏆',
  'Offer expires soon... ⏰',
  'Time remaining: 00:00 (looping)',
  'Combo: {n} misses! 🎯',
  'Difficulty: IMPOSSIBLE 😈',
  'By clicking No you agree to Yes 📜',
  'Are you sure? (Yes is the only option)',
  'Teddy has hired lawyers 👔',
  'System override in progress...',
  'No.exe has stopped working 💥',
  'Error 418: Not a valid choice 🫖',
  'This button is just for decoration 🎨',
  'Fun fact: No is not real 🎭',
  'There was never a No... only Yes ✨',
  'It will make me sad 🥺',
  'Resistance is futile 🚀',
];

const COMBO_TITLES = [
  '',
  'Rookie',
  'Persistent',
  'Determined',
  'Stubborn',
  'Resilient',
  'Unstoppable',
  'Legendary',
  'MYTHICAL',
  'GODLIKE',
  'STOP CLICKING NO',
];

const ENDING_VARIANTS: Array<{ title: string; subtitle: string; style: EndingStyle }> = [
  { title: 'YAYYY!! 🎉', subtitle: "I knew you'd say yes!! 🥹💖", style: 'romantic' },
  {
    title: 'CONGRATULATIONS! 🏆',
    subtitle: 'You found the only correct answer!',
    style: 'corporate',
  },
  {
    title: 'DESTINY ACCEPTED ✨',
    subtitle: 'The stars aligned for this moment 💫',
    style: 'dramatic',
  },
  { title: 'TOLD YOU SO 😎', subtitle: 'Resistance was futile from the start!', style: 'absurd' },
  { title: 'BAKA! 💢', subtitle: "You made me wait so long! But... I'm happy ❤️", style: 'anime' },
];

const ACHIEVEMENTS = [
  { at: 3, text: 'Achievement Unlocked: First Try 🎯' },
  { at: 5, text: 'Achievement Unlocked: Persistent 🏆' },
  { at: 8, text: 'Achievement Unlocked: Stop Resisting! 🎖️' },
  { at: 12, text: 'Achievement Unlocked: Master of Denial 👑' },
  { at: 15, text: 'Achievement Unlocked: Final Boss Defeated ⚔️' },
  { at: 18, text: 'Achievement Unlocked: Give Up Already 😤' },
  { at: 22, text: 'Achievement Unlocked: This Is Fine 🔥' },
];

// ==========================================
// EMOJI ARRAYS
// ==========================================

const BG_EMOJI = ['💕', '💗', '✨', '💘', '🌸', '💝', '🩷', '♥️', '💖', '🌺'];
const PARTY_EMOJI = [
  '🎉',
  '💖',
  '✨',
  '💕',
  '🥳',
  '💗',
  '🎊',
  '💝',
  '🩷',
  '❤️‍🔥',
  '🫶',
  '💐',
  '🎀',
  '🌟',
];
const FOOTPRINTS = ['👣', '🐾', '💔', '🚫'];

// ==========================================
// BEAR SVG COMPONENT
// ==========================================

function Bear({ mood, size = 'normal' }: { mood: Mood; size?: 'small' | 'normal' | 'large' }) {
  const sizeClasses = {
    small: 'w-20 h-20',
    normal: 'w-32 h-32 sm:w-40 sm:h-40',
    large: 'w-40 h-40 sm:w-56 sm:h-56',
  };

  return (
    <svg
      viewBox="0 0 200 200"
      className={`${sizeClasses[size]} transition-all duration-300`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ears */}
      <circle
        cx="55"
        cy="45"
        r="28"
        fill="#C4956A"
      />
      <circle
        cx="145"
        cy="45"
        r="28"
        fill="#C4956A"
      />
      <circle
        cx="55"
        cy="45"
        r="16"
        fill="#EDBBAB"
      />
      <circle
        cx="145"
        cy="45"
        r="16"
        fill="#EDBBAB"
      />

      {/* Face */}
      <circle
        cx="100"
        cy="100"
        r="60"
        fill="#C4956A"
      />
      <ellipse
        cx="100"
        cy="112"
        rx="38"
        ry="32"
        fill="#E8D0B8"
      />

      {/* Blush */}
      <ellipse
        cx="55"
        cy="112"
        rx="12"
        ry="7"
        fill="#FF9BB3"
        opacity="0.55"
      />
      <ellipse
        cx="145"
        cy="112"
        rx="12"
        ry="7"
        fill="#FF9BB3"
        opacity="0.55"
      />

      {/* Eyes */}
      <BearEyes mood={mood} />

      {/* Nose */}
      <ellipse
        cx="100"
        cy="108"
        rx="8"
        ry="6"
        fill="#4A3728"
      />
      <ellipse
        cx="97"
        cy="106"
        rx="3"
        ry="2"
        fill="#6B5242"
        opacity="0.5"
      />

      {/* Mouth */}
      <BearMouth mood={mood} />
    </svg>
  );
}

function BearEyes({ mood }: { mood: Mood }) {
  if (mood === 'love') {
    return (
      <>
        <g transform="translate(72,80) scale(0.55)">
          <path
            d="M12 4C12 4 9.5 0 6 0C2.5 0 0 3 0 6.5C0 13 12 20 12 20S24 13 24 6.5C24 3 21.5 0 18 0C14.5 0 12 4 12 4Z"
            fill="#FF4081"
          />
        </g>
        <g transform="translate(112,80) scale(0.55)">
          <path
            d="M12 4C12 4 9.5 0 6 0C2.5 0 0 3 0 6.5C0 13 12 20 12 20S24 13 24 6.5C24 3 21.5 0 18 0C14.5 0 12 4 12 4Z"
            fill="#FF4081"
          />
        </g>
      </>
    );
  }

  if (mood === 'hopeful') {
    return (
      <>
        <ellipse
          cx="80"
          cy="90"
          rx="9"
          ry="11"
          fill="#2D1B14"
        />
        <ellipse
          cx="120"
          cy="90"
          rx="9"
          ry="11"
          fill="#2D1B14"
        />
        <circle
          cx="84"
          cy="86"
          r="5"
          fill="white"
        />
        <circle
          cx="124"
          cy="86"
          r="5"
          fill="white"
        />
        <circle
          cx="77"
          cy="92"
          r="2.5"
          fill="white"
          opacity="0.5"
        />
        <circle
          cx="117"
          cy="92"
          r="2.5"
          fill="white"
          opacity="0.5"
        />
      </>
    );
  }

  if (mood === 'worried') {
    return (
      <>
        <ellipse
          cx="80"
          cy="90"
          rx="7"
          ry="9"
          fill="#2D1B14"
        />
        <ellipse
          cx="120"
          cy="90"
          rx="7"
          ry="9"
          fill="#2D1B14"
        />
        <circle
          cx="83"
          cy="87"
          r="3"
          fill="white"
        />
        <circle
          cx="123"
          cy="87"
          r="3"
          fill="white"
        />
        <line
          x1="67"
          y1="76"
          x2="85"
          y2="72"
          stroke="#4A3728"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="133"
          y1="76"
          x2="115"
          y2="72"
          stroke="#4A3728"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </>
    );
  }

  if (mood === 'crying') {
    return (
      <>
        <ellipse
          cx="80"
          cy="90"
          rx="7"
          ry="9"
          fill="#2D1B14"
        />
        <ellipse
          cx="120"
          cy="90"
          rx="7"
          ry="9"
          fill="#2D1B14"
        />
        <circle
          cx="83"
          cy="86"
          r="3"
          fill="white"
        />
        <circle
          cx="123"
          cy="86"
          r="3"
          fill="white"
        />
        <line
          x1="67"
          y1="74"
          x2="85"
          y2="70"
          stroke="#4A3728"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="133"
          y1="74"
          x2="115"
          y2="70"
          stroke="#4A3728"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <ellipse
          cx="66"
          cy="105"
          rx="4"
          ry="8"
          fill="#7EC8E3"
          opacity="0.6"
          className="animate-tear-l"
        />
        <ellipse
          cx="134"
          cy="105"
          rx="4"
          ry="8"
          fill="#7EC8E3"
          opacity="0.6"
          className="animate-tear-r"
        />
      </>
    );
  }

  // dead
  return (
    <>
      <line
        x1="72"
        y1="82"
        x2="88"
        y2="98"
        stroke="#2D1B14"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="88"
        y1="82"
        x2="72"
        y2="98"
        stroke="#2D1B14"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="112"
        y1="82"
        x2="128"
        y2="98"
        stroke="#2D1B14"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="128"
        y1="82"
        x2="112"
        y2="98"
        stroke="#2D1B14"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <ellipse
        cx="64"
        cy="108"
        rx="5"
        ry="10"
        fill="#7EC8E3"
        opacity="0.5"
        className="animate-tear-l"
      />
      <ellipse
        cx="136"
        cy="108"
        rx="5"
        ry="10"
        fill="#7EC8E3"
        opacity="0.5"
        className="animate-tear-r"
      />
    </>
  );
}

function BearMouth({ mood }: { mood: Mood }) {
  const paths: Record<Mood, string> = {
    love: 'M 85 120 Q 100 136 115 120',
    hopeful: 'M 88 122 Q 100 130 112 122',
    worried: 'M 88 128 Q 100 120 112 128',
    crying: 'M 85 130 Q 100 118 115 130',
    dead: 'M 82 133 Q 100 115 118 133',
  };

  return (
    <path
      d={paths[mood]}
      fill="none"
      stroke="#4A3728"
      strokeWidth="3"
      strokeLinecap="round"
    />
  );
}

// ==========================================
// BACKGROUND EFFECTS
// ==========================================

function FloatingHearts() {
  const items = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        emoji: BG_EMOJI[i % BG_EMOJI.length],
        x: Math.random() * 100,
        delay: Math.random() * 20,
        duration: 8 + Math.random() * 12,
        size: 14 + Math.random() * 22,
        opacity: 0.15 + Math.random() * 0.25,
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {items.map((item) => (
        <span
          key={item.id}
          className="animate-float absolute select-none"
          style={{
            left: `${item.x}%`,
            bottom: '-50px',
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
            fontSize: `${item.size}px`,
            opacity: item.opacity,
          }}
        >
          {item.emoji}
        </span>
      ))}
    </div>
  );
}

function Confetti({
  active,
  density = 'normal',
}: {
  active: boolean;
  density?: 'low' | 'normal' | 'high';
}) {
  const count = density === 'low' ? 40 : density === 'high' ? 120 : 80;

  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        emoji: PARTY_EMOJI[i % PARTY_EMOJI.length],
        x: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 2 + Math.random() * 4,
        size: 16 + Math.random() * 28,
      })),
    [count],
  );

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {bits.map((bit) => (
        <span
          key={bit.id}
          className="animate-confetti absolute select-none"
          style={{
            left: `${bit.x}%`,
            top: '-30px',
            animationDelay: `${bit.delay}s`,
            animationDuration: `${bit.duration}s`,
            fontSize: `${bit.size}px`,
          }}
        >
          {bit.emoji}
        </span>
      ))}
    </div>
  );
}

function MiniConfetti({
  count,
  centerRef,
}: {
  count: number;
  centerRef: React.RefObject<HTMLElement | null>;
}) {
  const [positions, setPositions] = useState<
    Array<{ x: number; y: number; emoji: string; delay: number }>
  >([]);

  useEffect(() => {
    const newPositions = Array.from({ length: count }, (_, i) => ({
      x: 40 + Math.random() * 20,
      y: 40 + Math.random() * 20,
      emoji: ['✨', '💕', '💖', '🌸', '💫'][i % 5],
      delay: Math.random() * 0.5,
    }));
    setPositions(newPositions);
  }, [count]);

  return (
    <>
      {positions.map((pos, i) => (
        <span
          key={i}
          className="animate-mini-confetti pointer-events-none absolute"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            animationDelay: `${pos.delay}s`,
          }}
        >
          {pos.emoji}
        </span>
      ))}
    </>
  );
}

function FootprintTrail({ positions }: { positions: Position[] }) {
  return (
    <>
      {positions.map((pos, i) => (
        <span
          key={i}
          className="animate-fade-out pointer-events-none fixed z-20 text-lg"
          style={{
            left: pos.x,
            top: pos.y,
            animationDelay: `${i * 0.1}s`,
          }}
        >
          {FOOTPRINTS[i % FOOTPRINTS.length]}
        </span>
      ))}
    </>
  );
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function getMood(attempts: number): Mood {
  if (attempts === 0) return 'love';
  if (attempts < 3) return 'hopeful';
  if (attempts < 7) return 'worried';
  if (attempts < 12) return 'crying';
  return 'dead';
}

function getStage(attempts: number): Stage {
  if (attempts < STAGES.playful) return 'intro';
  if (attempts < STAGES.persuasion) return 'playful';
  if (attempts < STAGES.chaos) return 'persuasion';
  if (attempts < STAGES.boss) return 'chaos';
  return 'boss';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ==========================================
// NO BUTTON CLONE COMPONENT
// ==========================================

function NoClone({
  x,
  y,
  scale,
  rotation,
  label,
  onClick,
}: {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="font-hand fixed z-30 rounded-xl border-2 border-rose-200 bg-white/90 px-5 py-2.5 text-rose-600 shadow-md backdrop-blur-sm transition-transform hover:scale-105"
      style={{
        left: x,
        top: y,
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        animation: 'tremble 0.3s linear infinite',
      }}
    >
      {label}
    </button>
  );
}

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================

export default function MorphButton() {
  // Core state
  const [attempts, setAttempts] = useState(0);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [ready, setReady] = useState(false);
  const [shake, setShake] = useState(false);
  const [endingIndex, setEndingIndex] = useState(0);

  // No button state
  const [noPos, setNoPos] = useState<Position>({ x: -9999, y: -9999 }); // Start off-screen, will be set
  const [noRotation, setNoRotation] = useState(0);
  const [noScale, setNoScale] = useState(1);
  const [noMode, setNoMode] = useState<NoMode>('button');
  const [noClones, setNoClones] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [noLabel, setNoLabel] = useState('No 😅');
  const [isNoVisible, setIsNoVisible] = useState(true);
  const [noHitboxScale, setNoHitboxScale] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const [isNoChecked, setIsNoChecked] = useState(false);
  const [draggedNoPos, setDraggedNoPos] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Yes button state
  const [yesScale, setYesScale] = useState(1);
  const [yesCopies, setYesCopies] = useState(0);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [yesGlow, setYesGlow] = useState(0);

  // UI effects
  const [cursorPos, setCursorPos] = useState<Position>({ x: 0, y: 0 });
  const [cursorVel, setCursorVel] = useState<Velocity>({ x: 0, y: 0 });
  const [lastCursorPos, setLastCursorPos] = useState<Position>({ x: 0, y: 0 });
  const [countdown, setCountdown] = useState(9);
  const [showDialog, setShowDialog] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [combo, setCombo] = useState(0);
  const [comboRank, setComboRank] = useState('');
  const [showAchievement, setShowAchievement] = useState<string | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [konamiProgress, setKonamiProgress] = useState(0);
  const [showUltraYes, setShowUltraYes] = useState(false);
  const [catchMeter, setCatchMeter] = useState(0);
  const [idleTime, setIdleTime] = useState(0);
  const [titleClicks, setTitleClicks] = useState(0);
  const [windowResized, setWindowResized] = useState(false);
  const [footprints, setFootprints] = useState<Position[]>([]);
  const [hoverTooltip, setHoverTooltip] = useState('');
  const [showFakeLag, setShowFakeLag] = useState(false);
  const [isGravityFlipped, setIsGravityFlipped] = useState(false);
  const [noVelocity, setNoVelocity] = useState<Velocity>({ x: 0, y: 0 });
  const [isElastic, setIsElastic] = useState(false);
  const [elasticOffset, setElasticOffset] = useState<Position>({ x: 0, y: 0 });
  const [safeZoneVisible, setSafeZoneVisible] = useState(false);
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [isYesMagnetic, setIsYesMagnetic] = useState(false);
  const [yesMagneticPos, setYesMagneticPos] = useState<Position>({ x: 0, y: 0 });
  const [parallaxOffset, setParallaxOffset] = useState<Position>({ x: 0, y: 0 });
  const [screenShake, setScreenShake] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [noBehindCard, setNoBehindCard] = useState(false);
  const [fakeDisabled, setFakeDisabled] = useState(false);
  const [longPressToast, setLongPressToast] = useState(false);
  const [isSliderSnapping, setIsSliderSnapping] = useState(false);

  // Refs
  const noBtnRef = useRef<HTMLButtonElement>(null);
  const yesBtnRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMoveTime = useRef(Date.now());
  const animationRef = useRef<number | undefined>(undefined);
  const inertiaRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });

  // Derived state
  const mood = getMood(attempts);
  const stage = getStage(attempts);
  const yesText = YEP_COPY[Math.min(attempts, YEP_COPY.length - 1)];
  const noText = NOPE_COPY[Math.min(attempts, NOPE_COPY.length - 1)];
  const showNo = attempts < NOPE_COPY.length - 1 && !showUltraYes;

  // Initialize
  useEffect(() => {
    setReady(true);

    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    // Random ending
    setEndingIndex(Math.floor(Math.random() * ENDING_VARIANTS.length));

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Cursor tracking with velocity
  useEffect(() => {
    let lastTime = Date.now();

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = Math.max(now - lastTime, 1);

      const newVel = {
        x: ((e.clientX - lastCursorPos.x) / dt) * 10,
        y: ((e.clientY - lastCursorPos.y) / dt) * 10,
      };

      setCursorVel(newVel);
      setCursorPos({ x: e.clientX, y: e.clientY });
      setLastCursorPos({ x: e.clientX, y: e.clientY });
      lastMoveTime.current = now;
      lastTime = now;
      setIdleTime(0);

      // Parallax effect
      if (!isReducedMotion && stage !== 'intro') {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        setParallaxOffset({
          x: (e.clientX - centerX) * -0.02,
          y: (e.clientY - centerY) * -0.02,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [lastCursorPos, isReducedMotion, stage]);

  // Idle detection
  useEffect(() => {
    const interval = setInterval(() => {
      const idle = Date.now() - lastMoveTime.current;
      if (idle > 3000) {
        setIdleTime((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (attempts < 9) return;
    const interval = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 9));
    }, 1000);
    return () => clearInterval(interval);
  }, [attempts]);

  // Konami code detection
  useEffect(() => {
    const konami = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];
    let index = 0;

    const handler = (e: KeyboardEvent) => {
      if (e.key === konami[index]) {
        index++;
        setKonamiProgress(index);
        if (index === konami.length) {
          setShowUltraYes(true);
          setShowAchievement('ULTRA YES MODE ACTIVATED! 🌟');
          setTimeout(() => setShowAchievement(null), 3000);
          index = 0;
        }
      } else {
        index = 0;
        setKonamiProgress(0);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // DevTools detection
  useEffect(() => {
    const checkDevTools = () => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > threshold || heightDiff > threshold) {
        setDevToolsOpen(true);
      }
    };

    window.addEventListener('resize', checkDevTools);
    return () => window.removeEventListener('resize', checkDevTools);
  }, []);

  // Window resize panic
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handler = () => {
      setWindowResized(true);
      timeout = setTimeout(() => setWindowResized(false), 2000);
      if (stage !== 'intro') {
        teleportNo(true);
      }
    };

    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('resize', handler);
      clearTimeout(timeout);
    };
  }, [stage]);

  // Long press detection for mobile
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const start = () => {
      timer = setTimeout(() => {
        setLongPressToast(true);
        setTimeout(() => setLongPressToast(false), 2000);
      }, 3000);
    };

    const end = () => clearTimeout(timer);

    document.addEventListener('touchstart', start);
    document.addEventListener('touchend', end);
    return () => {
      document.removeEventListener('touchstart', start);
      document.removeEventListener('touchend', end);
    };
  }, []);

  // Inertia physics loop
  useEffect(() => {
    if (!isDragging && (stage === 'chaos' || stage === 'boss') && noMode === 'draggable') {
      const animate = () => {
        inertiaRef.current.vx *= 0.95;
        inertiaRef.current.vy *= 0.95;

        if (Math.abs(inertiaRef.current.vx) > 0.1 || Math.abs(inertiaRef.current.vy) > 0.1) {
          setNoPos((prev) => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            let newX = prev.x + inertiaRef.current.vx;
            let newY = prev.y + inertiaRef.current.vy;

            // Bounce off walls
            if (newX < 20 || newX > vw - 100) {
              inertiaRef.current.vx *= -0.8;
              newX = clamp(newX, 20, vw - 100);
            }
            if (newY < 20 || newY > vh - 60) {
              inertiaRef.current.vy *= -0.8;
              newY = clamp(newY, 20, vh - 60);
            }

            return { x: newX, y: newY };
          });
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDragging, stage, noMode]);

  // Gravity flip effect
  useEffect(() => {
    if (attempts === 13 && !isReducedMotion) {
      setIsGravityFlipped(true);
      setTimeout(() => {
        setNoPos((prev) => ({ ...prev, y: window.innerHeight - 80 }));
        setTimeout(() => {
          setIsGravityFlipped(false);
          setNoPos((prev) => ({ ...prev, y: 20 }));
        }, 1000);
      }, 500);
    }
  }, [attempts, isReducedMotion]);

  // Zoom gag
  useEffect(() => {
    if (attempts >= 11 && !isReducedMotion) {
      const newZoom = 1 + (attempts - 10) * 0.03;
      setZoomLevel(clamp(newZoom, 1, 1.3));
    }
  }, [attempts, isReducedMotion]);

  // TELEPORT FUNCTION - Ensures No stays in viewport
  const teleportNo = useCallback(
    (isPanic = false) => {
      if (!noBtnRef.current) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const btnWidth = 100;
      const btnHeight = 50;

      // Padding to keep button visible
      const padding = 30;
      const maxX = vw - btnWidth - padding;
      const maxY = vh - btnHeight - padding;

      // Safe zone around Yes button
      let safeZone = { left: 0, right: vw, top: 0, bottom: vh };
      if (yesBtnRef.current) {
        const yesRect = yesBtnRef.current.getBoundingClientRect();
        const safePadding = 150;
        safeZone = {
          left: yesRect.left - safePadding,
          right: yesRect.right + safePadding,
          top: yesRect.top - safePadding,
          bottom: yesRect.bottom + safePadding,
        };
      }

      let newX: number, newY: number;
      let tryCount = 0;

      do {
        // Stage-based positioning strategy
        const edgePref = stage === 'chaos' || stage === 'boss' ? 0.8 : 0.4;
        const useEdge = Math.random() < edgePref;

        if (useEdge && !isPanic) {
          // Boundary hugging
          const edge = Math.floor(Math.random() * 4);
          switch (edge) {
            case 0:
              newX = padding + Math.random() * (maxX - padding);
              newY = padding;
              break;
            case 1:
              newX = maxX;
              newY = padding + Math.random() * (maxY - padding);
              break;
            case 2:
              newX = padding + Math.random() * (maxX - padding);
              newY = maxY;
              break;
            default:
              newX = padding;
              newY = padding + Math.random() * (maxY - padding);
          }
        } else {
          newX = padding + Math.random() * (maxX - padding);
          newY = padding + Math.random() * (maxY - padding);
        }
        tryCount++;
      } while (
        newX > safeZone.left - btnWidth &&
        newX < safeZone.right &&
        newY > safeZone.top - btnHeight &&
        newY < safeZone.bottom &&
        tryCount < 30
      );

      // Ensure within bounds
      newX = clamp(newX, padding, maxX);
      newY = clamp(newY, padding, maxY);

      // Add footprint trail
      setFootprints((prev) => [...prev.slice(-4), { x: noPos.x + 40, y: noPos.y + 25 }]);
      setTimeout(() => setFootprints((prev) => prev.slice(1)), 1000);

      // Apply position
      setNoPos({ x: newX, y: newY });

      // Reset velocity
      inertiaRef.current = { vx: 0, vy: 0 };

      // Rotation
      const rotMag =
        stage === 'boss' ? 30 : stage === 'chaos' ? 20 : stage === 'persuasion' ? 10 : 5;
      setNoRotation((Math.random() - 0.5) * rotMag * 2);

      // Show safe zone briefly
      if (stage === 'persuasion' || stage === 'chaos') {
        setSafeZoneVisible(true);
        setTimeout(() => setSafeZoneVisible(false), 500);
      }

      // Clones in chaos/boss
      if ((stage === 'chaos' || stage === 'boss') && !isReducedMotion) {
        const cloneCount = Math.min(Math.floor((attempts - 9) / 2) + 2, 6);
        const newClones = Array.from({ length: cloneCount }, (_, i) => ({
          x: clamp(newX + (Math.random() - 0.5) * 300, padding, maxX),
          y: clamp(newY + (Math.random() - 0.5) * 300, padding, maxY),
          id: Date.now() + i,
        }));
        setNoClones(newClones);
        setTimeout(() => setNoClones([]), 2000);
      }
    },
    [stage, attempts, noPos, isReducedMotion],
  );

  // Handle No click
  const handleNoClick = useCallback(
    (e?: React.MouseEvent | React.TouchEvent | undefined) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setCombo((prev) => prev + 1);
      setComboRank(COMBO_TITLES[Math.min(Math.floor(newAttempts / 2), COMBO_TITLES.length - 1)]);
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setScreenShake((prev) => Math.min(prev + 1, 5));

      // Screen shake decay
      setTimeout(() => setScreenShake((prev) => Math.max(prev - 1, 0)), 500);

      // Teleport
      if (newAttempts >= 1) {
        teleportNo();
      }

      // Multiple teleports
      if (newAttempts >= 4) {
        setTimeout(() => teleportNo(), 150);
      }
      if (newAttempts >= 8) {
        setTimeout(() => teleportNo(), 300);
        setTimeout(() => teleportNo(), 450);
      }

      // Yes button growth
      const newYesScale = Math.min(1 + newAttempts * 0.06, 2.5);
      setYesScale(newYesScale);
      setYesGlow(Math.min(newAttempts * 10, 100));

      // Yes copies
      if (newAttempts >= 3 && newAttempts < 10) {
        setYesCopies(Math.min(Math.floor((newAttempts - 2) / 2) + 1, 3));
      }

      // Full width mode
      if (newAttempts >= 14) {
        setIsFullWidth(true);
      }

      // Yes magnetic drift
      if (newAttempts >= 5) {
        setIsYesMagnetic(true);
      }

      // No button shrink
      const newNoScale = Math.max(0.25, 1 - newAttempts * 0.035);
      setNoScale(newNoScale);

      // Hitbox shrink
      const newHitbox = Math.max(0.25, 1 - newAttempts * 0.05);
      setNoHitboxScale(newHitbox);

      // Label evolution
      if (newAttempts === 1) setNoLabel('No');
      else if (newAttempts === 6) setNoLabel('No?');
      else if (newAttempts === 9) setNoLabel('N0');
      else if (newAttempts === 12) setNoLabel('Nah');
      else if (newAttempts === 15) setNoLabel('Nope');
      else if (newAttempts === 18) setNoLabel('...');
      else if (newAttempts === 21) setNoLabel('');

      // Mode transformations
      if (newAttempts === 7) {
        // Split button
        setNoMode('split');
        setTimeout(() => {
          setNoMode('button');
          teleportNo();
        }, 800);
      } else if (newAttempts === 10) {
        // Fake disabled
        setNoMode('fake');
        setTimeout(() => {
          setNoMode('button');
          teleportNo();
        }, 1200);
      } else if (newAttempts === 11) {
        // Loading spinner
        setNoMode('loading');
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          setLoadingProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setNoMode('button');
              teleportNo();
            }, 200);
          }
        }, 30);
      } else if (newAttempts === 16) {
        // Slider
        setNoMode('slider');
        setSliderValue(0);
      } else if (newAttempts === 19) {
        // Checkbox
        setNoMode('checkbox');
        setIsNoChecked(false);
      } else if (newAttempts === 22) {
        // Draggable
        setNoMode('draggable');
      }

      // Fake lag teleport
      if (newAttempts === 14) {
        setShowFakeLag(true);
        setTimeout(() => {
          setShowFakeLag(false);
          teleportNo();
        }, 400);
      }

      // Z-index trolling
      if (newAttempts === 12) {
        setNoBehindCard(true);
        setTimeout(() => {
          setNoBehindCard(false);
          teleportNo();
        }, 800);
      }

      // Fake disabled state
      if (newAttempts === 17) {
        setFakeDisabled(true);
        setTimeout(() => setFakeDisabled(false), 1000);
      }

      // Elastic band effect
      if (newAttempts >= 20 && !isReducedMotion) {
        setIsElastic(true);
        setTimeout(() => setIsElastic(false), 600);
      }

      // Show dialog
      if (newAttempts === 5) {
        setTimeout(() => setShowDialog(true), 300);
      }

      // Show captcha
      if (newAttempts === 13) {
        setShowCaptcha(true);
      }

      // Show difficulty selector
      if (newAttempts === 3) {
        setShowDifficulty(true);
        setTimeout(() => setShowDifficulty(false), 3000);
      }

      // Achievements
      const achievement = ACHIEVEMENTS.find((a) => a.at === newAttempts);
      if (achievement) {
        setShowAchievement(achievement.text);
        setTimeout(() => setShowAchievement(null), 2500);
      }

      // Tooltip rotation
      const tooltips = [
        'This option is currently closed.',
        'Please select Yes to continue.',
        'Error: No not available',
        'Loading No... (failed)',
        "Try the other button! It's nice!",
      ];
      setHoverTooltip(tooltips[newAttempts % tooltips.length]);
    },
    [attempts, teleportNo, stage, isReducedMotion, noPos],
  );

  // Handle No hover/dodge
  const handleNoHover = useCallback(
    (e: React.MouseEvent) => {
      if (attempts < 1 || isReducedMotion || noMode !== 'button') return;

      const rect = noBtnRef.current?.getBoundingClientRect();
      if (!rect) return;

      const btnCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      const dist = Math.hypot(e.clientX - btnCenter.x, e.clientY - btnCenter.y);
      const triggerDist = 130 + attempts * 12;

      if (dist < triggerDist) {
        // Path prediction
        const predictX = e.clientX + cursorVel.x * 8;
        const predictY = e.clientY + cursorVel.y * 8;

        const dx = btnCenter.x - predictX;
        const dy = btnCenter.y - predictY;
        const angle = Math.atan2(dy, dx);

        // Elastic effect in late stages
        if (attempts >= 20 && !isReducedMotion) {
          const stretchX = Math.cos(angle) * 30;
          const stretchY = Math.sin(angle) * 30;
          setElasticOffset({ x: stretchX, y: stretchY });
          setTimeout(() => {
            setElasticOffset({ x: 0, y: 0 });
            teleportNo();
          }, 300);
          return;
        }

        const moveDist = Math.max(120, triggerDist - dist + 60);
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let newX = btnCenter.x + Math.cos(angle) * moveDist - rect.width / 2;
        let newY = btnCenter.y + Math.sin(angle) * moveDist - rect.height / 2;

        // Clamp to viewport
        newX = clamp(newX, 30, vw - rect.width - 30);
        newY = clamp(newY, 30, vh - rect.height - 30);

        setNoPos({ x: newX, y: newY });
        setNoRotation((Math.random() - 0.5) * 25);

        // Catch meter
        setCatchMeter((prev) => {
          const newVal = Math.min(prev + 8, 100);
          if (newVal >= 100) {
            setTimeout(() => setCatchMeter(0), 300);
          }
          return newVal;
        });
      }
    },
    [attempts, cursorVel, teleportNo, noMode, isReducedMotion],
  );

  // Handle No mouse down (click escape)
  const handleNoMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (attempts >= 2 && !isReducedMotion && noMode === 'button') {
        e.preventDefault();
        e.stopPropagation();
        teleportNo();
      }
    },
    [attempts, teleportNo, noMode, isReducedMotion],
  );

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSliderValue(val);

    if (val > 70 && !isSliderSnapping) {
      setIsSliderSnapping(true);
      // Snap back to Yes
      const interval = setInterval(() => {
        setSliderValue((prev) => {
          if (prev <= 5) {
            clearInterval(interval);
            setIsSliderSnapping(false);
            setNoMode('button');
            handleNoClick();
            return 0;
          }
          return prev - 10;
        });
      }, 50);
    }
  };

  // Handle checkbox
  const handleCheckboxChange = () => {
    setIsNoChecked(true);
    setTimeout(() => {
      setIsNoChecked(false);
      handleNoClick();
    }, 100);
  };

  // Handle drag
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setDraggedNoPos({ x: clientX - 40, y: clientY - 25 });
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Calculate velocity for inertia
    if (draggedNoPos) {
      inertiaRef.current = {
        vx: (draggedNoPos.x - noPos.x) * 0.3,
        vy: (draggedNoPos.y - noPos.y) * 0.3,
      };
      setNoPos(draggedNoPos);
      setDraggedNoPos(null);

      // Teleport after drop
      setTimeout(() => teleportNo(), 300);
    }
  };

  // Handle Yes click
  const handleYesClick = useCallback(() => {
    setHasAccepted(true);
  }, []);

  // Title double click
  const handleTitleDoubleClick = useCallback(() => {
    setTitleClicks((prev) => prev + 1);
    if (titleClicks >= 1) {
      setShowAchievement('There was never a No... ✨');
      setTimeout(() => setShowAchievement(null), 3000);
    }
  }, [titleClicks]);

  // No focus handler (tab trap)
  const handleNoFocus = useCallback(() => {
    if (attempts >= 2) {
      teleportNo();
    }
  }, [attempts, teleportNo]);

  // Render helpers
  const renderNoButton = () => {
    if (showUltraYes) {
      return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-center">
          <span className="text-gray-400 line-through">No</span>
          <p className="text-sm text-pink-500">Does not exist in Ultra Yes Mode</p>
        </div>
      );
    }

    if (!showNo) return null;

    const isFixed = attempts > 0;
    const commonStyles: React.CSSProperties = {
      position: isFixed ? 'fixed' : 'relative',
      left: isFixed ? (isDragging && draggedNoPos ? draggedNoPos.x : noPos.x) : undefined,
      top: isFixed ? (isDragging && draggedNoPos ? draggedNoPos.y : noPos.y) : undefined,
      transform: `scale(${noScale}) rotate(${noRotation}deg) translate(${elasticOffset.x}px, ${elasticOffset.y}px)`,
      opacity: Math.max(0.5, 1 - attempts * 0.03),
      clipPath: `inset(${(1 - noHitboxScale) * 50}%)`,
      zIndex: noBehindCard ? 5 : 40,
      cursor: noMode === 'draggable' ? 'grab' : 'pointer',
    };

    switch (noMode) {
      case 'split':
        return (
          <div
            className={`${isFixed ? 'fixed' : 'relative'} z-40 flex`}
            style={isFixed ? { left: noPos.x, top: noPos.y } : {}}
          >
            <button
              className="font-hand animate-split-left rounded-l-xl border-2 border-rose-200 bg-white px-4 py-2 text-rose-600"
              onClick={() => handleNoClick()}
            >
              N
            </button>
            <button
              className="font-hand animate-split-right rounded-r-xl border-2 border-rose-200 bg-white px-4 py-2 text-rose-600"
              onClick={() => handleNoClick()}
            >
              o
            </button>
          </div>
        );

      case 'fake':
        return (
          <div
            className={`${isFixed ? 'fixed' : 'relative'} font-hand z-40 rounded-xl bg-gray-100 px-6 py-3 text-gray-400`}
            style={commonStyles}
          >
            No (disabled)
          </div>
        );

      case 'loading':
        return (
          <div
            className={`${isFixed ? 'fixed' : 'relative'} z-40 flex flex-col items-center gap-2`}
            style={isFixed ? { left: noPos.x, top: noPos.y } : {}}
          >
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" />
            <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-rose-500 transition-all duration-100"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">Loading...</span>
          </div>
        );

      case 'slider':
        return (
          <div
            className={`${isFixed ? 'fixed' : 'relative'} z-40 w-48 rounded-xl bg-white/90 p-4 shadow-lg backdrop-blur-sm`}
            style={isFixed ? { left: noPos.x - 60, top: noPos.y } : {}}
          >
            <label className="font-hand mb-2 block text-center text-sm text-rose-600">
              Slide to No
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={handleSliderChange}
              className="w-full cursor-pointer accent-rose-500"
              disabled={isSliderSnapping}
            />
            <p className="mt-1 text-center text-xs text-gray-400">
              {isSliderSnapping ? 'Snapping back...' : '(it snaps to Yes)'}
            </p>
          </div>
        );

      case 'checkbox':
        return (
          <label
            className={`${isFixed ? 'fixed' : 'relative'} z-40 flex cursor-pointer items-center gap-2 rounded-xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur-sm`}
            style={commonStyles}
          >
            <input
              type="checkbox"
              checked={isNoChecked}
              onChange={handleCheckboxChange}
              className="h-5 w-5 accent-rose-500"
            />
            <span className="font-hand text-rose-600">No</span>
          </label>
        );

      case 'draggable':
        return (
          <button
            ref={noBtnRef}
            className={`${isFixed ? 'fixed' : 'relative'} font-hand z-40 rounded-xl border-2 border-rose-200 bg-white px-6 py-3 text-rose-700 shadow-sm transition-all duration-150 active:cursor-grabbing ${fakeDisabled ? 'opacity-50 grayscale' : ''}`}
            style={commonStyles}
            onMouseDown={handleDragStart}
            onMouseMove={handleDrag}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDrag}
            onTouchEnd={handleDragEnd}
            onFocus={handleNoFocus}
          >
            {noLabel || 'Drag me'}
            <span className="ml-2 text-xs">(then watch me escape)</span>
          </button>
        );

      default:
        return (
          <button
            ref={noBtnRef}
            onClick={(e) => handleNoClick(e)}
            onMouseMove={handleNoHover}
            onMouseDown={handleNoMouseDown}
            onFocus={handleNoFocus}
            className={`${isFixed ? 'fixed' : 'relative'} font-hand z-40 rounded-xl border-2 border-rose-200 bg-white px-6 py-3 text-rose-700 shadow-sm transition-all duration-150 hover:bg-rose-50 ${
              stage === 'playful'
                ? 'animate-tilt'
                : stage === 'persuasion'
                  ? 'animate-tremble'
                  : stage === 'chaos'
                    ? 'animate-spin-slow'
                    : stage === 'boss'
                      ? 'animate-panic'
                      : ''
            } ${fakeDisabled ? 'opacity-50 grayscale' : ''}`}
            style={commonStyles}
            data-tooltip={hoverTooltip}
            title={hoverTooltip}
          >
            {noLabel}

            {/* Magnetic repulsion ring */}
            {attempts >= 4 && (
              <span className="animate-pulse-ring pointer-events-none absolute inset-0 -m-6 rounded-full border-2 border-rose-200/40" />
            )}

            {/* Fake lag indicator */}
            {showFakeLag && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce rounded-full bg-yellow-400 px-2 py-0.5 text-xs whitespace-nowrap text-yellow-900">
                Loading...
              </span>
            )}
          </button>
        );
    }
  };

  // Success/Ending Screen
  if (hasAccepted) {
    const ending = ENDING_VARIANTS[endingIndex];
    return (
      <div className="bg-gradient-party fixed inset-0 flex flex-col items-center justify-center overflow-hidden">
        <Confetti
          active={true}
          density="high"
        />

        <div className="animate-fade-scale z-10 flex max-w-2xl flex-col items-center gap-8 px-6 text-center">
          {/* Big celebration bears */}
          <div className="flex items-center justify-center gap-4">
            <div className="animate-bounce-gentle">
              <Bear
                mood="love"
                size="large"
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="animate-pulse text-7xl">💞</span>
              <span className="mt-2 text-4xl">🎉</span>
            </div>
            <div
              className="animate-bounce-gentle -scale-x-100"
              style={{ animationDelay: '0.2s' }}
            >
              <Bear
                mood="love"
                size="large"
              />
            </div>
          </div>

          {/* Main title with glow */}
          <div className="relative">
            <h1
              className={`font-display text-6xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] sm:text-8xl ${ending.style === 'anime' ? 'animate-bounce' : ''}`}
            >
              {ending.title}
            </h1>
            <div className="absolute -inset-4 -z-10 rounded-full bg-white/20 blur-3xl" />
          </div>

          {/* Subtitle */}
          <p className="font-hand text-3xl text-white/95 sm:text-4xl">{ending.subtitle}</p>

          {/* Message card */}
          <div className="mt-6 w-full max-w-lg rounded-[2rem] border-2 border-white/40 bg-white/25 px-10 py-8 shadow-2xl backdrop-blur-xl">
            <p className="text-xl leading-relaxed font-medium text-white">
              You just made this bear the happiest in the whole entire universe!!
            </p>
            <div className="mt-4 flex justify-center gap-2 text-4xl">
              <span>🧸</span>
              <span>✨</span>
              <span>💖</span>
              <span>🌟</span>
              <span>🎊</span>
            </div>
          </div>

          {/* Stats */}
          {attempts > 0 && (
            <div className="flex items-center gap-4 rounded-full bg-black/20 px-6 py-3 backdrop-blur-sm">
              <span className="text-white/80">It only took you</span>
              <span className="text-2xl font-bold text-white">{attempts}</span>
              <span className="text-white/80">tries to say yes! 😄</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main Game Screen
  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 flex flex-col items-center justify-center overflow-hidden ${shake ? 'animate-shake' : ''}`}
      style={{
        background:
          'linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 25%, #FFB6C1 50%, #FF69B4 75%, #FF4081 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradient-shift 10s ease infinite',
        transform: `scale(${zoomLevel})`,
      }}
    >
      <FloatingHearts />

      {/* Footprint trails */}
      <FootprintTrail positions={footprints} />

      {/* Safe zone indicator */}
      {safeZoneVisible && yesBtnRef.current && (
        <div
          className="pointer-events-none fixed z-10 animate-pulse rounded-2xl border-2 border-dashed border-yellow-400/50"
          style={{
            left: yesBtnRef.current.getBoundingClientRect().left - 100,
            top: yesBtnRef.current.getBoundingClientRect().top - 100,
            width: yesBtnRef.current.getBoundingClientRect().width + 200,
            height: yesBtnRef.current.getBoundingClientRect().height + 200,
          }}
        />
      )}

      {/* Fog of war / Spotlight */}
      {(stage === 'chaos' || stage === 'boss') && !isReducedMotion && (
        <div
          className="pointer-events-none fixed inset-0 z-10"
          style={{
            background: `radial-gradient(circle ${150 + attempts * 5}px at ${cursorPos.x}px ${cursorPos.y}px, transparent 0%, rgba(255,255,255,0.15) 100%)`,
          }}
        />
      )}

      {/* Main Card */}
      <div
        ref={cardRef}
        className={`relative z-20 flex w-full max-w-md flex-col items-center gap-5 rounded-[2.5rem] bg-white/95 px-8 pt-12 pb-10 shadow-2xl backdrop-blur-sm transition-all duration-500 ${ready ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        style={{
          transform: `translate(${parallaxOffset.x}px, ${parallaxOffset.y}px)`,
          boxShadow: `0 25px 50px -12px rgba(255, 64, 129, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.5) inset`,
        }}
      >
        {/* Notifications */}
        {devToolsOpen && (
          <div className="animate-fade-in absolute -top-14 left-1/2 -translate-x-1/2 rounded-full bg-gray-800 px-4 py-1.5 text-sm whitespace-nowrap text-white shadow-lg">
            I saw that. 👀
          </div>
        )}

        {windowResized && (
          <div className="animate-pop absolute -top-14 left-1/2 -translate-x-1/2 rounded-full bg-red-500 px-4 py-1.5 text-sm font-bold whitespace-nowrap text-white shadow-lg">
            Hey, don&apos;t cheat! 🛑
          </div>
        )}

        {showAchievement && (
          <div className="animate-pop absolute -top-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-yellow-400 px-5 py-2 font-bold whitespace-nowrap text-yellow-900 shadow-xl">
            {showAchievement}
          </div>
        )}

        {longPressToast && (
          <div className="animate-fade-in absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-4 py-1.5 text-sm text-white">
            Nice try! 📱
          </div>
        )}

        {/* Konami progress */}
        {konamiProgress > 0 && konamiProgress < 10 && (
          <div className="absolute -top-12 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-black/20 px-3 py-1">
            {Array.from({ length: konamiProgress }).map((_, i) => (
              <span
                key={i}
                className="animate-pop text-lg"
              >
                ⬆️
              </span>
            ))}
            <span className="ml-1 text-xs text-white/70">{konamiProgress}/10</span>
          </div>
        )}

        {/* Ultra Yes Mode Indicator */}
        {showUltraYes && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 animate-pulse">
            <span className="rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-5 py-2 text-sm font-bold text-white shadow-xl">
              🌟 ULTRA YES MODE 🌟
            </span>
          </div>
        )}

        {/* Fake difficulty selector */}
        {showDifficulty && (
          <div className="absolute top-3 right-4 flex gap-2 text-xs font-medium">
            <button className="rounded bg-gray-200 px-2 py-1 text-gray-500 line-through">
              Easy
            </button>
            <button className="animate-pulse rounded bg-pink-200 px-2 py-1 text-pink-700">
              Medium
            </button>
            <button className="rounded bg-gray-200 px-2 py-1 text-gray-500 line-through">
              Hard
            </button>
          </div>
        )}

        {/* Idle sneak message */}
        {idleTime > 0 && idleTime < 4 && stage !== 'intro' && (
          <div className="animate-fade-in absolute -top-12 left-1/2 -translate-x-1/2">
            <p className="font-hand rounded-full bg-white/80 px-4 py-1 text-lg text-rose-600 shadow-sm">
              Teddy is sneaking closer... {idleTime >= 2 ? '👀' : ''}
            </p>
          </div>
        )}

        {/* Bear */}
        <div
          className={`transition-all duration-500 ${
            attempts === 0
              ? 'animate-bounce-gentle'
              : attempts < 7
                ? 'animate-wobble'
                : 'animate-tremble'
          }`}
          style={{
            transform: `scale(${0.8 + yesScale * 0.2})`,
          }}
        >
          <Bear
            mood={mood}
            size="normal"
          />
        </div>

        {/* Title */}
        <h1
          className="font-display cursor-pointer text-center text-2xl leading-tight font-black tracking-tight text-gray-900 select-none sm:text-3xl"
          onDoubleClick={handleTitleDoubleClick}
          title="Double click me for a secret!"
        >
          Will you be my <br />
          <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 bg-clip-text text-4xl text-transparent sm:text-5xl">
            Valentine?
          </span>
        </h1>

        {/* Subtitle */}
        {attempts > 0 && (
          <p className="font-hand animate-fade-in -mt-1 text-center text-lg text-rose-600">
            {noText}
          </p>
        )}

        {/* Analytics */}
        {attempts >= 4 && (
          <div className="animate-fade-in flex gap-6 rounded-full bg-gray-100 px-4 py-2 text-xs font-medium text-gray-500">
            <span className="text-red-500">❌ No success: 0%</span>
            <span className="text-green-500">✅ Yes success: 100%</span>
          </div>
        )}

        {/* Countdown */}
        {attempts >= 9 && (
          <div className="animate-pulse rounded-full border border-red-200 bg-gradient-to-r from-red-100 to-pink-100 px-5 py-2 text-sm font-bold text-red-600">
            ⏰ Offer expires in 00:0{countdown}
          </div>
        )}

        {/* Combo */}
        {attempts >= 6 && (
          <div className="animate-fade-in text-center">
            <p className="font-hand text-base text-purple-600">
              Combo: {combo} misses!{' '}
              {combo >= 15 ? '🔥🔥🔥' : combo >= 10 ? '🔥🔥' : combo >= 5 ? '🔥' : ''}
            </p>
            {comboRank && <p className="mt-0.5 text-xs font-bold text-purple-500">{comboRank}</p>}
          </div>
        )}

        {/* Catch meter */}
        {attempts >= 8 && (
          <div className="w-full max-w-[220px]">
            <div className="mb-1 flex justify-between text-xs font-medium text-gray-500">
              <span>🏃 Catch meter</span>
              <span>{catchMeter}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full border border-gray-300 bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 transition-all duration-100"
                style={{ width: `${catchMeter}%` }}
              />
            </div>
          </div>
        )}

        {/* Fake Captcha */}
        {showCaptcha && (
          <div className="animate-pop rounded-xl border-2 border-gray-300 bg-gray-50 p-5 text-center shadow-inner">
            <p className="mb-3 text-sm font-medium text-gray-700">
              Select all squares with &quot;No&quot;
            </p>
            <div className="mb-3 grid grid-cols-3 gap-1.5">
              {Array.from({ length: 9 }).map((_, i) => (
                <button
                  key={i}
                  className="flex h-14 cursor-pointer items-center justify-center rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 text-sm font-bold text-rose-600 transition-all hover:scale-105 hover:shadow-md active:scale-95"
                  onClick={() => setShowCaptcha(false)}
                >
                  Yes
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 italic">Hint: Every square is &quot;Yes&quot; 😏</p>
          </div>
        )}

        {/* Yes Buttons Area */}
        <div
          className={`mt-2 flex w-full flex-col items-center gap-4 ${isFullWidth ? 'px-0' : ''}`}
        >
          {/* Extra Yes copies */}
          {yesCopies > 0 && (
            <div className="flex flex-wrap justify-center gap-3">
              {Array.from({ length: yesCopies }).map((_, i) => (
                <button
                  key={i}
                  onClick={handleYesClick}
                  className="animate-bounce-gentle rounded-xl bg-gradient-to-r from-pink-400 to-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-110 active:scale-95"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  Yes! 💖
                </button>
              ))}
            </div>
          )}

          {/* Main Yes Button */}
          <button
            ref={yesBtnRef}
            onClick={handleYesClick}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 font-bold text-white shadow-2xl transition-all hover:shadow-pink-500/50 active:scale-95"
            style={{
              padding: `${16 + attempts * 1.5}px ${44 + attempts * 4}px`,
              fontSize: `${1.1 + attempts * 0.045}rem`,
              transform: `scale(${yesScale})`,
              width: isFullWidth ? '100%' : 'auto',
              boxShadow: `0 0 ${20 + yesGlow}px rgba(255, 64, 129, ${0.3 + yesGlow * 0.005})`,
            }}
          >
            <span className="font-hand relative z-10 flex items-center gap-2">{yesText}</span>

            {/* Confetti around Yes */}
            {attempts >= 5 && !isReducedMotion && (
              <MiniConfetti
                count={Math.min(attempts - 4, 10)}
                centerRef={yesBtnRef}
              />
            )}

            {/* Shimmer effect */}
            {attempts >= 7 && (
              <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            )}

            {/* Pulse ring */}
            {attempts >= 3 && (
              <span className="animate-pulse-ring absolute inset-0 rounded-2xl bg-white/20" />
            )}
          </button>
        </div>

        {/* No Button - Inside card when attempts=0, becomes fixed when clicked */}
        {attempts === 0 && showNo && <div className="mt-4">{renderNoButton()}</div>}

        {/* Broken hearts */}
        {attempts > 0 && (
          <div className="flex flex-wrap justify-center gap-1 text-base">
            {Array.from({ length: Math.min(attempts, 16) }, (_, i) => (
              <span
                key={i}
                className="animate-pop"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                💔
              </span>
            ))}
          </div>
        )}

        {/* Footer footnote */}
        {attempts >= 18 && (
          <button
            onClick={handleNoClick}
            className="animate-bounce-gentle fixed bottom-4 text-xs text-gray-400 underline decoration-dotted transition-colors hover:text-gray-600"
            style={{
              left: `${20 + ((attempts * 3) % 60)}%`,
            }}
          >
            no thanks (good luck clicking this)
          </button>
        )}
      </div>

      {/* No Button Clones */}
      {noClones.map((clone) => (
        <NoClone
          key={clone.id}
          x={clone.x}
          y={clone.y}
          scale={noScale * 0.9}
          rotation={(Math.random() - 0.5) * 30}
          label={noLabel || 'No'}
          onClick={handleNoClick}
        />
      ))}

      {/* Main No Button - Fixed position when attempts > 0 */}
      {attempts > 0 && renderNoButton()}

      {/* Are You Sure Dialog */}
      {showDialog && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="animate-pop mx-4 max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
            <h3 className="font-display mb-2 text-2xl font-bold text-gray-900">Are you sure?</h3>
            <p className="mb-6 text-gray-600">Think carefully about your choice...</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setShowDialog(false);
                  handleYesClick();
                }}
                className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
              >
                Yes! 💖
              </button>
              <button
                onClick={() => {
                  setShowDialog(false);
                  handleNoClick();
                }}
                className="rounded-xl bg-gray-200 px-8 py-3 font-bold text-gray-700 transition-all hover:scale-105 hover:bg-gray-300 active:scale-95"
              >
                Also Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Boss Phase */}
      {stage === 'boss' && attempts === 15 && (
        <div className="animate-boss-appear pointer-events-none fixed top-20 z-50">
          <h2 className="font-display text-center text-5xl font-black text-red-600 drop-shadow-2xl">
            ⚔️ FINAL BOSS: NO ⚔️
          </h2>
          <p className="mt-2 text-center font-bold text-red-500">IMPOSSIBLE DIFFICULTY</p>
        </div>
      )}
    </div>
  );
}
