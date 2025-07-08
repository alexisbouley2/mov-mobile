import React, { createContext, useContext, useState } from "react";

interface RecordingContextType {
  isRecording: boolean;
  setIsRecording: (_recording: boolean) => void;
}

const RecordingContext = createContext<RecordingContextType | undefined>(
  undefined
);

export const RecordingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <RecordingContext.Provider value={{ isRecording, setIsRecording }}>
      {children}
    </RecordingContext.Provider>
  );
};

export const useRecording = () => {
  const context = useContext(RecordingContext);
  if (context === undefined) {
    throw new Error("useRecording must be used within a RecordingProvider");
  }
  return context;
};
