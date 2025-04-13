"use client"

// Sound files
const CLICK_SOUND_URL = "/sounds/click.mp3"
const DELETE_SOUND_URL = "/sounds/delete.mp3"

// Cache for audio objects
let clickSound: HTMLAudioElement | null = null
let deleteSound: HTMLAudioElement | null = null

// Initialize sounds
function initSounds() {
  if (typeof window === "undefined") return

  if (!clickSound) {
    clickSound = new Audio(CLICK_SOUND_URL)
    clickSound.volume = 0.5
  }

  if (!deleteSound) {
    deleteSound = new Audio(DELETE_SOUND_URL)
    deleteSound.volume = 0.5
  }
}

// Play click sound
export function playClickSound() {
  if (typeof window === "undefined") return

  initSounds()

  if (clickSound) {
    clickSound.currentTime = 0
    clickSound.play().catch((err) => {
      // Ignore autoplay errors
      console.log("Could not play sound:", err)
    })
  }
}

// Play delete sound
export function playDeleteSound() {
  if (typeof window === "undefined") return

  initSounds()

  if (deleteSound) {
    deleteSound.currentTime = 0
    deleteSound.play().catch((err) => {
      // Ignore autoplay errors
      console.log("Could not play sound:", err)
    })
  }
}

// Check if sounds are enabled
export function getSoundEnabled(): boolean {
  if (typeof window === "undefined") return true

  const enabled = localStorage.getItem("soundEnabled")
  return enabled === null ? true : enabled === "true"
}

// Set sound enabled state
export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return

  localStorage.setItem("soundEnabled", enabled.toString())
}
