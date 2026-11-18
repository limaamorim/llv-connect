import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

// Ponto de entrada: coloca o componente App dentro do elemento #root do HTML.
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
