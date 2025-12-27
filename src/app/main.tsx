/**
 * Application entry point.
 * Creates the service container and renders the app with providers.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ServiceProvider, createContainer } from '../core/di';
import '../styles/globals.css';
import '../styles/theme.css';
import '../styles/animations.css';

/**
 * Create the service container with all dependencies.
 * This is the composition root - where all services are wired together.
 */
const container = createContainer();

/**
 * Render the application.
 * ServiceProvider makes all services available to the component tree.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ServiceProvider container={container}>
      <App />
    </ServiceProvider>
  </React.StrictMode>
);
