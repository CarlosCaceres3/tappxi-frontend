import { createContext, useContext } from 'react';
const SocketContext = createContext({ connected: true });
export const SocketProvider = ({ children }) => (
  <SocketContext.Provider value={{ connected: true }}>
    {children}
  </SocketContext.Provider>
);
export const useSocket = () => useContext(SocketContext);
