import { inject } from 'vue'

export function usePixel () {
  const pixel = inject('VueFbq')

  // Return a safe fallback if injection fails
  return pixel || {
    event: () => { },
    track: () => { }
  }
}
