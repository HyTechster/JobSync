function seenStorageKey(seenKey: string): string {
  return `jobsync_tour_seen_${seenKey}`
}

export function hasSeenTour(seenKey: string): boolean {
  return localStorage.getItem(seenStorageKey(seenKey)) === '1'
}

export function markTourSeen(seenKey: string): void {
  localStorage.setItem(seenStorageKey(seenKey), '1')
}
