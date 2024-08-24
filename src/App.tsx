import ChoiceButtons from './components/ChoiceButtons';
import CommentDisplay from './components/CommentDisplay';
import OverlayEffects from './components/OverlayEffects';
import ScoreDisplay from './components/ScoreDisplay';
import { CommentProvider } from './contexts/CommentProvider';
import { GameProvider } from './contexts/GameProvider';
import { ScoreProvider } from './contexts/ScoreProvider';

function App() {
  return (
    <ScoreProvider>
      <CommentProvider>
        <GameProvider>
          <OverlayEffects />
          <div className="w-screen h-screen bg-gray-900 flex flex-col justify-between">
            <ScoreDisplay />
            <CommentDisplay />
            <ChoiceButtons />
          </div>
        </GameProvider>
      </CommentProvider>
    </ScoreProvider>
  );
}

export default App;
