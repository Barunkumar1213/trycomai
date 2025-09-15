import { addAliases } from 'module-alias';
import path from 'path';

// Register module aliases
addAliases({
  '@': path.join(__dirname, '..'),
  '@config': path.join(__dirname, '..', 'config'),
  '@controllers': path.join(__dirname, '..', 'controllers'),
  '@models': path.join(__dirname, '..', 'models'),
  '@routes': path.join(__dirname, '..', 'routes'),
  '@services': path.join(__dirname, '..', 'services'),
  '@utils': path.join(__dirname, '..', 'utils'),
});

export {};
