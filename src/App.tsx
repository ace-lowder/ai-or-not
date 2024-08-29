import OverlayEffects from './components/OverlayEffects';
import InfoButton from './components/InfoButton';
import ScoreDisplay from './components/ScoreDisplay';
import RoundDisplay from './components/RoundDisplay';
import ButtonDisplay from './components/ButtonDisplay';
import { CommentProvider } from './contexts/CommentProvider';
import { ScoreProvider } from './contexts/ScoreProvider';
import { GameProvider } from './contexts/GameProvider';

function App() {
  return (
    <div className="w-screen h-screen max-w-screen max-h-screen min-w-80 min-h-[512px] flex flex-col justify-center items-center overflow-hidden bg-gray-900 select-none -z-10">
      <div className="w-full h-full max-w-[480px] max-h-[720px] flex flex-col z-10 ">
        <div className="w-full flex justify-between p-4 z-20">
          <ScoreProvider>
            <ScoreDisplay />
          </ScoreProvider>

          <InfoButton />
        </div>

        <CommentProvider>
          <GameProvider>
            <div className="grow">
              <RoundDisplay />
            </div>

            <ButtonDisplay />
          </GameProvider>
        </CommentProvider>
      </div>

      <div className="animated-background fixed inset-0 z-0" />
      <OverlayEffects />
    </div>
  );
}

export default App;
