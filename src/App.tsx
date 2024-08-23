import ScoreDisplay from './components/ScoreDisplay';
import { ScoreProvider } from './contexts/ScoreProvider';

function App() {
  return (
    <ScoreProvider>
      <div className="w-screen h-screen bg-gray-900">
        <ScoreDisplay />
      </div>
    </ScoreProvider>
  );
}

export default App;
