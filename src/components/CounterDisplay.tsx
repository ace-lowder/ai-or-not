import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { increment } from '../store/slices/counterSlice';

const CounterDisplay = () => {
  const dispatch = useDispatch();
  const counter = useSelector((state: RootState) => state.counter.value);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(increment());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [dispatch]);

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
