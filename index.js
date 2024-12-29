import { registerRootComponent } from 'expo';
import App from './App';
import { ToastProvider } from 'react-native-styled-toast'
import {SheetProvider} from 'react-native-actions-sheet';

const Root = () => {
  return (
      <>
      <ToastProvider maxToasts={1} offset={65} position="TOP">
      <SheetProvider context="global">
      <App/>
      </SheetProvider>
      </ToastProvider>
      </>
  );
}
registerRootComponent(Root);

