import { createRoot } from 'react-dom/client';
import './main.css';

const appNode = document.getElementById('app');
if (appNode !== null) {
    const root = createRoot(appNode);
    root.render(<h1>fophelper</h1>);
}
