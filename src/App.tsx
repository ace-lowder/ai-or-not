import CommentDisplay from './components/CommentDisplay';
import ScoreDisplay from './components/ScoreDisplay';
import { CommentProvider } from './contexts/CommentProvider';
import { ScoreProvider } from './contexts/ScoreProvider';

function App() {
  return (
    <ScoreProvider>
      <CommentProvider>
        <div className="w-screen h-screen bg-gray-900 flex items-center justify-center">
          <ScoreDisplay />
          <CommentDisplay />
        </div>
      </CommentProvider>
    </ScoreProvider>
  );
}

export default App;
