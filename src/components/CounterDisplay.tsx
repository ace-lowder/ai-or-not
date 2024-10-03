import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const CounterDisplay = () => {
  const counter = useSelector((state: RootState) => state.counter.value); // Access Redux state

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
      }}
    >
      Counter: {counter} {/* Display Redux counter */}
    </div>
  );
};

export default CounterDisplay;
