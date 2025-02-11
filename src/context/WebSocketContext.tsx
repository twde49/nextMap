import { createContext, useState } from 'react';
import type { ReactNode } from 'react'
import WebSocketComponent from '../components/webSocketComponent';

interface WebSocketContextType {
  userCount: number;
  positions: number[];
  setUserCount: (count: number) => void;
  setPositions: (positions: number[]) => void;
}

export const WebSocketContext = createContext<WebSocketContextType>({
  userCount: 0,
  positions: [],
  setUserCount: () => {},
  setPositions: () => {}
});

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [userCount, setUserCount] = useState(0);
  const [positions, setPositions] = useState<number[]>([]);

  return (
    <WebSocketContext.Provider value={{ userCount, positions, setUserCount, setPositions }}>
      <WebSocketComponent />
      {children}
    </WebSocketContext.Provider>
  );
};