import OverlayEffects from './components/OverlayEffects';
import LivesDisplay from './components/LivesDisplay';
import ScoreDisplay from './components/ScoreDisplay';
import RoundDisplay from './components/RoundDisplay';
import ButtonDisplay from './components/ButtonDisplay';
import { CommentProvider } from './contexts/CommentProvider';
import { ScoreProvider } from './contexts/ScoreProvider';
import { GameProvider } from './contexts/GameProvider';

import { Provider } from 'react-redux';
import { store } from './store/store';
import CounterDisplay from './components/CounterDisplay';

function App() {
  return (
    <Provider store={store}>
      <div className="w-screen h-screen max-w-screen max-h-screen min-w-80 min-h-[512px] flex flex-col justify-center items-center overflow-hidden bg-gray-900 select-none -z-10">
        <div className="w-full h-full max-w-[480px] max-h-[1280px] md:max-h-[720px] md:max-w-[720px] flex flex-col z-10 ">
          <ScoreProvider>
            <CommentProvider>
              <GameProvider>
                <div className="w-full flex justify-between p-4 z-20">
                  <div className="w-full flex justify-between">
                    <ScoreDisplay />
                    <LivesDisplay />
                  </div>
                </div>

                <div className="grow">
                  <RoundDisplay />
                </div>

                <ButtonDisplay />
              </GameProvider>
            </CommentProvider>
          </ScoreProvider>
        </div>

        <div className="animated-background fixed inset-0 z-0" />
        <OverlayEffects />

        <CounterDisplay />
      </div>
    </Provider>
  );
}

export default App;
