// Ambient type declarations for @google/model-viewer web component
// This file extends JSX.IntrinsicElements to allow <model-viewer> in TSX

declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          poster?: string;
          loading?: string;
          reveal?: string;
          "auto-rotate"?: boolean | string;
          "auto-rotate-delay"?: number | string;
          "rotation-per-second"?: string;
          "camera-controls"?: boolean | string;
          "touch-action"?: string;
          "disable-zoom"?: boolean | string;
          "disable-pan"?: boolean | string;
          "disable-tap"?: boolean | string;
          "camera-orbit"?: string;
          "camera-target"?: string;
          "field-of-view"?: string;
          "min-camera-orbit"?: string;
          "max-camera-orbit"?: string;
          "min-field-of-view"?: string;
          "max-field-of-view"?: string;
          "interpolation-decay"?: number | string;
          "shadow-intensity"?: number | string;
          "shadow-softness"?: number | string;
          exposure?: number | string;
          "environment-image"?: string;
          "skybox-image"?: string;
          "skybox-height"?: string;
          ar?: boolean | string;
          "ar-modes"?: string;
          "ar-scale"?: string;
          "ar-placement"?: string;
          "ios-src"?: string;
          "animation-name"?: string;
          "animation-crossfade-duration"?: number | string;
          autoplay?: boolean | string;
          "variant-name"?: string;
          orientation?: string;
          scale?: string;
          "interaction-prompt"?: string;
          "interaction-prompt-style"?: string;
          "interaction-prompt-threshold"?: number | string;
        },
        HTMLElement
      >;
    }
  }
}
