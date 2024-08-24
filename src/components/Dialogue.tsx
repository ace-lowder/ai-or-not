interface DialogueProps {
  children: React.ReactNode;
}

const Dialogue: React.FC<DialogueProps> = ({ children }) => {
  return (
    <div className="max-w-md mx-auto bg-gray-800 text-white text-center rounded-xl p-4 m-4 shadow-lg">
      {children}
    </div>
  );
};

export default Dialogue;
