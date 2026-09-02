import {StrictMode} from 'react';import {createRoot} from 'react-dom/client';import {Provider} from 'react-redux';import {store} from './state/store';import {AppBootstrap} from './app/App';import './styles/app.css';
createRoot(document.getElementById('root')!).render(<StrictMode><Provider store={store}><AppBootstrap/></Provider></StrictMode>);
