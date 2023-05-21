import { createRoot } from 'react-dom/client';
import { App } from './components/App';

const appNode = document.getElementById('app');
if (appNode !== null) {
    const root = createRoot(appNode);
    root.render(<App />);
}
