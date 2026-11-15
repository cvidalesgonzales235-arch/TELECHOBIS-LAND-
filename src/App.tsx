import { useCallback, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  ensureNewGameSave,
  recordPlayerDeath,
  saveNightVictory,
  signInWithGoogle,
  signOutPlayer,
  subscribeAuth,
  subscribeToPlayerSave,
} from './firebase/client';
import { JumpscareSource, PlayerSave, ScreenState, TelechobiId } from './types/game';
import { soundEngine } from './audio/soundEngine';
import { MainMenu } from './components/MainMenu';
import { NewspaperIntro } from './components/NewspaperIntro';
import { NightIntroScreen } from './components/NightIntroScreen';
import { OfficeGameplay } from './components/OfficeGameplay';
import { JumpscareOverlay } from './components/JumpscareOverlay';
import { VictoryScreen } from './components/VictoryScreen';
import { ExtrasModal } from './components/ExtrasModal';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [playerSave, setPlayerSave] = useState<PlayerSave | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [screen, setScreen] = useState<ScreenState>('MENU');
  const [activeNight, setActiveNight] = useState<number>(1);
  const [muted, setMuted] = useState(false);

  const [killer, setKiller] = useState<TelechobiId>('ton');
  const [killerSource, setKillerSource] = useState<JumpscareSource>('door');
  const [lastPowerRemaining, setLastPowerRemaining] = useState<number>(0);

  // Subscribe to Firebase Authentication
  useEffect(() => {
    const unsub = subscribeAuth((firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      if (!firebaseUser) {
        setPlayerSave(null);
        setSaveLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // Subscribe to Firestore PlayerSave document only when authenticated
  useEffect(() => {
    if (!user) return;
    setSaveLoading(true);
    const unsub = subscribeToPlayerSave(
      user.uid,
      (save) => {
        setPlayerSave(save);
        setSaveLoading(false);
      },
      () => {
        setSaveLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      return next;
    });
  }, []);

  const handleSignIn = useCallback(async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('popup-closed-by-user')) {
        setAuthError('Inicio de sesión cancelado. Conecta tu cuenta para guardar en Firebase.');
      } else {
        setAuthError('No se pudo conectar con Google Auth. Intenta nuevamente.');
      }
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setAuthError(null);
    await signOutPlayer();
    setScreen('MENU');
  }, []);

  const handleNewGame = useCallback(async () => {
    setAuthError(null);
    let activeUser = user;
    if (!activeUser) {
      try {
        activeUser = await signInWithGoogle();
      } catch {
        setAuthError(
          'Debes iniciar sesión con Google para registrar tu partida en Firebase y comenzar Nuevo Juego.'
        );
        return;
      }
    }

    try {
      await ensureNewGameSave(activeUser);
      setActiveNight(1);
      soundEngine.stopAmbience();
      setScreen('NEWSPAPER');
    } catch {
      setAuthError('Error al crear la partida en Firebase.');
    }
  }, [user]);

  const handleContinue = useCallback(() => {
    if (!user || !playerSave) return;
    const nightToPlay = Math.max(1, Math.min(6, playerSave.currentNight));
    setActiveNight(nightToPlay);
    soundEngine.stopAmbience();
    setScreen('NIGHT_INTRO');
  }, [user, playerSave]);

  const handleOpenExtras = useCallback(() => {
    if (!playerSave?.extrasUnlocked) return;
    soundEngine.stopAmbience();
    setScreen('EXTRAS');
  }, [playerSave]);

  const handleNightWin = useCallback(
    async (remainingPower: number) => {
      setLastPowerRemaining(remainingPower);
      setScreen('NIGHT_WIN');
      if (user) {
        try {
          await saveNightVictory(user, activeNight, remainingPower);
        } catch (err) {
          console.error('Failed to save night victory:', err);
        }
      }
    },
    [user, activeNight]
  );

  const handleJumpscare = useCallback(
    (attacker: TelechobiId, source: JumpscareSource, hoursSurvived: number) => {
      setKiller(attacker);
      setKillerSource(source);
      setScreen('JUMPSCARE');
      if (user) {
        void recordPlayerDeath(user, hoursSurvived).catch((err) => {
          console.error('Failed to record death:', err);
        });
      }
    },
    [user]
  );

  const handleVictoryContinue = useCallback(() => {
    if (activeNight < 6) {
      setActiveNight((n) => n + 1);
      setScreen('NIGHT_INTRO');
    } else {
      setScreen('MENU');
    }
  }, [activeNight]);

  if (screen === 'MENU') {
    return (
      <MainMenu
        user={user}
        authLoading={authLoading}
        playerSave={playerSave}
        saveLoading={saveLoading}
        authError={authError}
        muted={muted}
        onToggleMute={handleToggleMute}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onNewGame={handleNewGame}
        onContinue={handleContinue}
        onOpenExtras={handleOpenExtras}
      />
    );
  }

  if (screen === 'NEWSPAPER') {
    return <NewspaperIntro onContinue={() => setScreen('NIGHT_INTRO')} />;
  }

  if (screen === 'NIGHT_INTRO') {
    return (
      <NightIntroScreen
        night={activeNight}
        onReady={() => setScreen('PLAYING')}
      />
    );
  }

  if (screen === 'PLAYING') {
    return (
      <OfficeGameplay
        key={`night-${activeNight}`}
        night={activeNight}
        muted={muted}
        onToggleMute={handleToggleMute}
        onNightWin={handleNightWin}
        onJumpscare={handleJumpscare}
        onExitToMenu={() => {
          soundEngine.stopAmbience();
          soundEngine.stopMaskBreathing();
          setScreen('MENU');
        }}
      />
    );
  }

  if (screen === 'JUMPSCARE' || screen === 'GAME_OVER') {
    return (
      <JumpscareOverlay
        killer={killer}
        source={killerSource}
        night={activeNight}
        phase={screen}
        onJumpscareDone={() => setScreen('GAME_OVER')}
        onRetryNight={() => setScreen('NIGHT_INTRO')}
        onBackToMenu={() => setScreen('MENU')}
      />
    );
  }

  if (screen === 'NIGHT_WIN') {
    return (
      <VictoryScreen
        night={activeNight}
        remainingPower={lastPowerRemaining}
        isNight6={activeNight === 6}
        onContinue={handleVictoryContinue}
      />
    );
  }

  if (screen === 'EXTRAS') {
    return <ExtrasModal onBack={() => setScreen('MENU')} />;
  }

  return null;
}
