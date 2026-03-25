import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Terminal, Zap, Trophy } from 'lucide-react';

// --- CONSTANTS ---
const GRID_SIZE = 20;
const CELL_SIZE = 20; // px
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 120;

const TRACKS = [
  { id: 1, title: "SYS.INIT // AI_GEN_01", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "MEM.LEAK // AI_GEN_02", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "KERNEL.PANIC // AI_GEN_03", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

export default function App() {
  // --- GAME STATE ---
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 15, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [highScore, setHighScore] = useState(0);

  // --- MUSIC STATE ---
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- GAME LOGIC ---
  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      const isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) break;
    }
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setFood({ x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
      }
      
      if (!gameStarted && !gameOver && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        setGameStarted(true);
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameStarted, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        // Wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true);
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood());
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(intervalId);
  }, [direction, food, gameStarted, gameOver, generateFood]);

  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
    }
  }, [gameOver, score, highScore]);

  // --- MUSIC LOGIC ---
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIdx]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const nextTrack = () => {
    setCurrentTrackIdx((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };
  
  const prevTrack = () => {
    setCurrentTrackIdx((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTrackEnd = () => {
    nextTrack();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#00ffff] font-mono flex flex-col items-center justify-center p-4 relative overflow-hidden screen-tear">
      <div className="scanlines"></div>
      <div className="crt-flicker"></div>

      {/* HEADER */}
      <header className="w-full max-w-4xl flex justify-between items-end mb-8 border-b-2 border-[#ff00ff] pb-4 z-10">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter glitch-text uppercase neon-text-cyan" data-text="NEON_SNAKE">
            NEON_SNAKE
          </h1>
          <p className="text-[#ff00ff] text-[10px] md:text-xs mt-3 tracking-widest uppercase animate-pulse drop-shadow-[0_0_5px_rgba(255,0,255,0.8)]">v.9.9.9 // SYSTEM.ONLINE</p>
        </div>
        <div className="text-right flex flex-col items-end gap-3">
          <div className="text-2xl md:text-3xl flex items-center gap-3">
            <Zap className="w-8 h-8 md:w-10 md:h-10 text-[#00ffff] drop-shadow-[0_0_12px_rgba(0,255,255,1)] animate-pulse" />
            <span className="text-[#ff00ff] drop-shadow-[0_0_12px_rgba(255,0,255,1)]">{score.toString().padStart(4, '0')}</span>
          </div>
          <div className="text-xs md:text-sm text-[#00ffff] flex items-center gap-2">
            <Trophy className="w-4 h-4 md:w-5 md:h-5 text-[#ff00ff] drop-shadow-[0_0_8px_rgba(255,0,255,1)]" />
            <span className="drop-shadow-[0_0_8px_rgba(0,255,255,1)]">{highScore.toString().padStart(4, '0')}</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="w-full max-w-4xl flex flex-col md:flex-row gap-8 z-10">
        
        {/* GAME BOARD */}
        <div className="flex-1 flex justify-center">
          <div 
            className="relative bg-[#0a0a0a] border-2 border-[#00ffff] shadow-[0_0_15px_rgba(0,255,255,0.5)]"
            style={{ 
              width: GRID_SIZE * CELL_SIZE, 
              height: GRID_SIZE * CELL_SIZE,
              boxShadow: gameOver ? '0 0 30px rgba(255,0,255,0.8)' : '0 0 15px rgba(0,255,255,0.5)'
            }}
          >
            {/* Grid Lines */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{
                   backgroundImage: 'linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)',
                   backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
                 }}>
            </div>

            {/* Food */}
            <div 
              className="absolute bg-[#ff00ff] shadow-[0_0_10px_#ff00ff] animate-pulse"
              style={{
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                left: food.x * CELL_SIZE + 1,
                top: food.y * CELL_SIZE + 1,
              }}
            />

            {/* Snake */}
            {snake.map((segment, idx) => (
              <div 
                key={idx}
                className="absolute bg-[#00ffff]"
                style={{
                  width: CELL_SIZE - 2,
                  height: CELL_SIZE - 2,
                  left: segment.x * CELL_SIZE + 1,
                  top: segment.y * CELL_SIZE + 1,
                  opacity: idx === 0 ? 1 : 0.8 - (idx * 0.02),
                  boxShadow: idx === 0 ? '0 0 10px #00ffff' : 'none'
                }}
              />
            ))}

            {/* Overlays */}
            {!gameStarted && !gameOver && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center flex-col text-center p-4">
                <Terminal className="w-8 h-8 text-[#ff00ff] mb-4 animate-bounce" />
                <p className="text-[10px] md:text-xs animate-pulse leading-loose">PRESS ANY DIRECTION KEY<br/>TO INITIATE</p>
              </div>
            )}

            {gameOver && (
              <div className="absolute inset-0 bg-black/90 flex items-center justify-center flex-col text-center p-4 border-4 border-[#ff00ff]">
                <h2 className="text-2xl md:text-3xl text-[#ff00ff] glitch-text mb-2" data-text="FATAL_ERROR">FATAL_ERROR</h2>
                <p className="text-[10px] text-gray-400 mb-6">ENTITY_COLLISION_DETECTED</p>
                <button 
                  onClick={resetGame}
                  className="px-6 py-3 border-2 border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-black transition-all duration-200 uppercase text-[10px] tracking-widest focus:outline-none"
                >
                  REBOOT_SYSTEM
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MUSIC PLAYER */}
        <div className="w-full md:w-80 flex flex-col gap-4">
          <div className="bg-[#0a0a0a] border border-[#ff00ff] p-6 shadow-[0_0_10px_rgba(255,0,255,0.2)] relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00ffff] to-[#ff00ff]"></div>
            
            <h3 className="text-[10px] text-gray-500 mb-4 uppercase tracking-widest flex items-center gap-2">
              <Volume2 className="w-4 h-4" /> AUDIO_SUBSYSTEM
            </h3>
            
            <div className="mb-6 h-12 flex items-center">
              <div className={`text-xs ${isPlaying ? 'glitch-text text-[#00ffff]' : 'text-gray-600'}`} data-text={TRACKS[currentTrackIdx].title}>
                {TRACKS[currentTrackIdx].title}
              </div>
            </div>

            {/* Visualizer bars (fake) */}
            <div className="flex items-end gap-1 h-8 mb-6 opacity-50">
              {[...Array(16)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-full bg-[#ff00ff]"
                  style={{ 
                    height: isPlaying ? `${Math.random() * 100}%` : '10%',
                    transition: 'height 0.2s ease'
                  }}
                ></div>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <button onClick={prevTrack} className="p-2 text-[#00ffff] hover:text-[#ff00ff] hover:scale-110 transition-transform focus:outline-none">
                <SkipBack className="w-6 h-6" />
              </button>
              
              <button 
                onClick={togglePlay} 
                className="p-4 rounded-full border-2 border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-black transition-all focus:outline-none shadow-[0_0_10px_rgba(0,255,255,0.5)]"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
              </button>
              
              <button onClick={nextTrack} className="p-2 text-[#00ffff] hover:text-[#ff00ff] hover:scale-110 transition-transform focus:outline-none">
                <SkipForward className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-6 flex justify-between items-center border-t border-gray-800 pt-4">
              <span className="text-[8px] text-gray-600">TRACK {currentTrackIdx + 1}/{TRACKS.length}</span>
              <button onClick={() => setIsMuted(!isMuted)} className="text-gray-500 hover:text-[#00ffff] focus:outline-none">
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* DECORATIVE TERMINAL */}
          <div className="flex-1 bg-[#050505] border border-gray-800 p-4 font-mono text-[8px] text-gray-600 overflow-hidden relative min-h-[120px]">
            <div className="absolute top-0 left-0 w-2 h-full bg-gray-900"></div>
            <div className="pl-4 leading-relaxed">
              <p>{'>'} INITIALIZING KERNEL...</p>
              <p>{'>'} LOADING MODULES [OK]</p>
              <p>{'>'} MOUNTING VFS [OK]</p>
              <p>{'>'} AUDIO_DRIVER: LOADED</p>
              <p>{'>'} SNAKE_PROTOCOL: ACTIVE</p>
              <p className="text-[#00ffff] mt-2 animate-pulse">_</p>
            </div>
          </div>
        </div>

      </main>

      <audio 
        ref={audioRef} 
        src={TRACKS[currentTrackIdx].url} 
        onEnded={handleTrackEnd}
        preload="auto"
      />
    </div>
  );
}
