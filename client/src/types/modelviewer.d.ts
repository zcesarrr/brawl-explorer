import { ModelViewerElement } from '@google/model-viewer';
import { DetailedHTMLProps, HTMLAttributes } from 'react';

type ModelViewerProps = DetailedHTMLProps<
  HTMLAttributes<ModelViewerElement>,
  ModelViewerElement
> & {
  src?: string;
  alt?: string;
  poster?: string;
  loading?: 'eager' | 'lazy' | 'auto';
  reveal?: 'auto' | 'interaction' | 'manual';
  ar?: boolean;
  'ar-modes'?: string;
  'ar-scale'?: 'auto' | 'fixed';
  'camera-controls'?: boolean;
  'auto-rotate'?: boolean;
  'auto-rotate-delay'?: string;
  'shadow-intensity'?: string;
  'environment-image'?: string;
  'animation-name'?: string;
  autoplay?: boolean;
  'camera-orbit'?: string;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerProps;
    }
  }
}