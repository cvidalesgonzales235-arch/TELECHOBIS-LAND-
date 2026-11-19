import { useCallback, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  ensureNewGameSave,
  getContinueNight,
  recordPlayerDeath,
  saveNightVictory,
  saveSecretNight2Victory,
  signInWithGoogle,
  signOutPlayer,
  subscribeAuth,
  subscribeToPlayerSave,
  syncLegacyNight7Continue,
} from './firebase/client';
import {
  CustomNightLaunchConfig,
  JumpscareSource,
  PlayerSave,
  ScreenState,
  TelechobiId,
} from './types/game';
import { soundEngine } from './audio/soundEngine';
import { MainMenu } from './components/MainMenu';
import { NewspaperIntro } from './components/NewspaperIntro';
import { NightIntroScreen } from './components/NightIntroScreen';
import { OfficeGameplay } from './components/OfficeGameplay';
import { JumpscareOverlay } from './components/JumpscareOverlay';
import { VictoryScreen } from './components/VictoryScreen';
import { ExtrasModal } from './components/ExtrasModal';
import { NightSetupModal } from './components/NightSetupModal';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [playerSave, setPlayerSave] = useState<PlayerSave | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [screen, setScreen] = useState<ScreenState>('MENU');
  const [activeNight, setActiveNight] = useState<number>(1);
  const [activeLaunchConfig, setActiveLaunchConfig] = useState<CustomNightLaunchConfig | undefined>(
    undefined
  );
  const [showNightSelector, setShowNightSelector] = useState(false);
  const [continueNightModal, setContinueNightModal] = useState<number | null>(null);
  const [muted, setMuted] = useState(false);

  const [killer, setKiller] = useState<TelechobiId>('ton');
  const [killerSource, setKillerSource] = useState<JumpscareSource>('door');
  const [lastPowerRemaining, setLastPowerRemaining] = useState<number>(0);
  const [localSecretUnlocked, setLocalSecretUnlocked] = useState(false);

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
        if (
          save &&
          !save.night7Completed &&
          (save.night6Completed || save.completedNights >= 6 || save.extrasUnlocked) &&
          save.currentNight === 6
        ) {
          void syncLegacyNight7Continue(user, save).catch((err) => {
            console.error('Failed to migrate legacy Night 6 save to Night 7:', err);
          });
        }
      },
      () => {
        setSaveLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  // Keep "Five Nights at Candy's OST - Menu Theme" playing across Main Menu and Extras (all submenus)
  useEffect(() => {
    if (screen === 'MENU' || screen === 'EXTRAS') {
      soundEngine.startMenuMusic();
    } else {
      soundEngine.stopMenuMusic();
    }
  }, [screen]);

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
      setActiveLaunchConfig(undefined);
      setActiveNight(1);
      soundEngine.stopMenuMusic();
      soundEngine.stopAmbience();
      setScreen('NEWSPAPER');
    } catch {
      setAuthError('Error al crear la partida en Firebase.');
    }
  }, [user]);

  const isProgressionUnlocked = Boolean(
    user && (playerSave?.extrasUnlocked || playerSave?.night7Completed)
  );
  const isSecretUnlocked = Boolean(playerSave?.secretNight2Completed || localSecretUnlocked);

  const handleContinue = useCallback(() => {
    if (!user || !playerSave) return;
    const nightToPlay = getContinueNight(playerSave);
    if (nightToPlay === 7 || isProgressionUnlocked) {
      setContinueNightModal(nightToPlay);
      return;
    }
    setActiveLaunchConfig(undefined);
    setActiveNight(nightToPlay);
    soundEngine.stopMenuMusic();
    soundEngine.stopAmbience();
    setScreen('NIGHT_INTRO');
  }, [user, playerSave, isProgressionUnlocked]);

  const handleLaunchConfig = useCallback((config: CustomNightLaunchConfig) => {
    setShowNightSelector(false);
    setContinueNightModal(null);
    setActiveLaunchConfig(config);
    setActiveNight(config.night);
    soundEngine.stopMenuMusic();
    soundEngine.stopAmbience();
    setScreen('NIGHT_INTRO');
  }, []);

  const handleOpenExtras = useCallback(() => {
    if (!isProgressionUnlocked) return;
    soundEngine.stopAmbience();
    soundEngine.startMenuMusic();
    setScreen('EXTRAS');
  }, [isProgressionUnlocked]);

  const handleNightWin = useCallback(
    async (remainingPower: number) => {
      soundEngine.stopNightMusic();
      soundEngine.stopVentSound();
      soundEngine.stopCharroVoice();
      soundEngine.stopNonCrawl();
      soundEngine.stopCamInterference();
      setLastPowerRemaining(remainingPower);
      setScreen('NIGHT_WIN');
      const cheatsUsed = Boolean(
        activeLaunchConfig?.cheats &&
          Object.values(activeLaunchConfig.cheats).some(Boolean)
      );
      const isDefinitive = Boolean(activeLaunchConfig?.isDefinitiveNight);
      const isSecretBrainrot = Boolean(activeLaunchConfig?.isSecretBrainrotNight);
      const fromSelector = Boolean(activeLaunchConfig?.fromNightSelector);
      const isCustom = Boolean(activeLaunchConfig?.isCustomAI);

      if (isSecretBrainrot) {
        setLocalSecretUnlocked(true);
        if (user) {
          try {
            await saveSecretNight2Victory(user);
          } catch (err) {
            console.error('Failed to save secret brainrot night victory:', err);
          }
        }
        return;
      }

      if (user && !isDefinitive) {
        if (fromSelector) {
          try {
            await saveNightVictory(user, activeNight, remainingPower, {
              keepSelectedNight: true,
              allowCheatsUpdate: cheatsUsed || isCustom,
            });
          } catch (err) {
            console.error('Failed to save selected night victory:', err);
          }
        } else if (!isCustom && !cheatsUsed) {
          try {
            await saveNightVictory(user, activeNight, remainingPower);
          } catch (err) {
            console.error('Failed to save night victory:', err);
          }
        }
      }
    },
    [user, activeNight, activeLaunchConfig]
  );

  const handleJumpscare = useCallback(
    (attacker: TelechobiId, source: JumpscareSource, hoursSurvived: number) => {
      soundEngine.stopNightMusic();
      soundEngine.stopVentSound();
      soundEngine.stopCharroVoice();
      soundEngine.stopNonCrawl();
      soundEngine.stopCamInterference();
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
    if (!activeLaunchConfig && activeNight < 7) {
      setActiveNight((n) => n + 1);
      setScreen('NIGHT_INTRO');
    } else {
      setActiveLaunchConfig(undefined);
      setScreen('MENU');
    }
  }, [activeNight, activeLaunchConfig]);

  if (screen === 'MENU') {
    return (
      <>
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
          onSelectNight={() => {
            if (isProgressionUnlocked) setShowNightSelector(true);
          }}
          onOpenExtras={handleOpenExtras}
        />
        {showNightSelector && isProgressionUnlocked && (
          <NightSetupModal
            secretUnlocked={isSecretUnlocked}
            onClose={() => setShowNightSelector(false)}
            onLaunch={handleLaunchConfig}
          />
        )}
        {continueNightModal !== null && (
          <NightSetupModal
            initialNight={continueNightModal}
            allowPickOtherNight={isProgressionUnlocked}
            secretUnlocked={isSecretUnlocked}
            onClose={() => setContinueNightModal(null)}
            onLaunch={handleLaunchConfig}
          />
        )}
      </>
    );
  }

  if (screen === 'NEWSPAPER') {
    return <NewspaperIntro onContinue={() => setScreen('NIGHT_INTRO')} />;
  }

  if (screen === 'NIGHT_INTRO') {
    return (
      <NightIntroScreen
        night={activeNight}
        launchConfig={activeLaunchConfig}
        onReady={() => setScreen('PLAYING')}
      />
    );
  }

  if (screen === 'PLAYING') {
    return (
      <OfficeGameplay
        key={`night-${activeNight}`}
        night={activeNight}
        launchConfig={activeLaunchConfig}
        muted={muted}
        onToggleMute={handleToggleMute}
        onNightWin={handleNightWin}
        onJumpscare={handleJumpscare}
        onExitToMenu={() => {
          soundEngine.stopNightMusic();
          soundEngine.stopVentSound();
          soundEngine.stopAmbience();
          soundEngine.stopMaskBreathing();
          setActiveLaunchConfig(undefined);
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
        isCustomNight={Boolean(activeLaunchConfig?.isCustomAI)}
        phase={screen}
        onJumpscareDone={() => setScreen('GAME_OVER')}
        onRetryNight={() => setScreen('NIGHT_INTRO')}
        onBackToMenu={() => {
          setActiveLaunchConfig(undefined);
          setScreen('MENU');
        }}
      />
    );
  }

  if (screen === 'NIGHT_WIN') {
    return (
      <VictoryScreen
        night={activeNight}
        remainingPower={lastPowerRemaining}
        isNight6={!activeLaunchConfig?.isDefinitiveNight && !activeLaunchConfig?.isSecretBrainrotNight && activeNight === 6}
        isNight7={!activeLaunchConfig?.isDefinitiveNight && !activeLaunchConfig?.isSecretBrainrotNight && activeNight === 7}
        isDefinitiveNight={Boolean(activeLaunchConfig?.isDefinitiveNight)}
        isSecretBrainrotNight={Boolean(activeLaunchConfig?.isSecretBrainrotNight)}
        fromNightSelector={Boolean(activeLaunchConfig?.fromNightSelector)}
        onContinue={handleVictoryContinue}
      />
    );
  }

  if (screen === 'EXTRAS') {
    return (
      <ExtrasModal
        secretUnlocked={isSecretUnlocked}
        onBack={() => setScreen('MENU')}
        onLaunchConfig={handleLaunchConfig}
      />
    );
  }

  return null;
}
