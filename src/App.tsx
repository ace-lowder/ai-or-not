import OverlayEffects from './components/OverlayEffects';
import ScoreDisplay from './components/ScoreDisplay';
import RoundDisplay from './components/RoundDisplay';
import ButtonDisplay from './components/ButtonDisplay';
import { CommentProvider } from './contexts/CommentProvider';
import { GameProvider } from './contexts/GameProvider';
import { ScoreProvider } from './contexts/ScoreProvider';

function App() {
  return (
    <ScoreProvider>
      <CommentProvider>
        <GameProvider>
          <OverlayEffects />
          <div className="w-screen h-screen max-h-screen flex flex-col justify-center items-center overflow-hidden bg-gray-900">
            <ScoreDisplay />
            <RoundDisplay />
            <ButtonDisplay />
          </div>
        </GameProvider>
      </CommentProvider>
    </ScoreProvider>
  );
}

export default App;
