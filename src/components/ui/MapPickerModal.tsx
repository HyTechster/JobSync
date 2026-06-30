import { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Modal } from './Modal'
import { Icons } from './Icons'

// Fix default marker icons broken by Vite's asset pipeline
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIconUrl from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)['_getIconUrl']
L.Icon.Default.mergeOptions({
  iconUrl:       markerIconUrl,
  iconRetinaUrl: markerIcon2x,
  shadowUrl:     markerShadow,
})

interface NominatimAddress {
  house_number?: string
  road?:         string
  neighbourhood?: string
  suburb?:       string
  city?:         string
  town?:         string
  village?:      string
  state?:        string
  postcode?:     string
}

interface NominatimResult {
  lat:          string
  lon:          string
  display_name: string
  address:      NominatimAddress
}

export interface MapPickerResult {
  street:   string
  city:     string
  state:    string
  postcode: string
}

function parseAddress(addr: NominatimAddress): MapPickerResult {
  const streetParts = [addr.house_number, addr.road].filter(Boolean)
  return {
    street:   streetParts.join(' ') || addr.neighbourhood || addr.suburb || '',
    city:     addr.city || addr.town || addr.village || addr.suburb || '',
    state:    addr.state || '',
    postcode: addr.postcode || '',
  }
}

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) })
  return null
}

function FlyToMarker({
  position,
  duration,
}: {
  position: [number, number] | null
  duration: number
}) {
  const map = useMap()
  const prev = useRef<string | null>(null)

  useEffect(() => {
    if (!position) return
    const key = position.join(',')
    if (key === prev.current) return
    prev.current = key
    map.flyTo(position, 16, { duration, animate: duration > 0 })
  }, [position, map, duration])

  return null
}

const MALAYSIA_CENTER: [number, number] = [4.2105, 101.9758]
const NOMINATIM_HEADERS = { 'Accept-Language': 'en' }

interface MapPickerModalProps {
  isOpen:     boolean
  onClose:    () => void
  onConfirm:  (result: MapPickerResult) => void
}

export function MapPickerModal({ isOpen, onClose, onConfirm }: MapPickerModalProps) {
  const [markerPos, setMarkerPos]       = useState<[number, number] | null>(null)
  const [address, setAddress]           = useState<MapPickerResult | null>(null)
  const [isGeocoding, setIsGeocoding]   = useState(false)
  const [flyDuration, setFlyDuration]   = useState(0)
  const [searchQuery, setSearchQuery]   = useState('')
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([])
  const [isSearching, setIsSearching]   = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        { headers: NOMINATIM_HEADERS }
      )
      const data = await res.json() as NominatimResult
      setAddress(parseAddress(data.address))
    } catch {
      setAddress({ street: '', city: '', state: '', postcode: '' })
    } finally {
      setIsGeocoding(false)
    }
  }, [])

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      setFlyDuration(0)
      setMarkerPos([lat, lng])
      void reverseGeocode(lat, lng)
    },
    [reverseGeocode]
  )

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }
    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=5&countrycodes=my`,
          { headers: NOMINATIM_HEADERS }
        )
        const data = await res.json() as NominatimResult[]
        setSearchResults(data)
        setShowDropdown(data.length > 0)
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 500)
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current)
    }
  }, [searchQuery])

  function handleSelectResult(result: NominatimResult) {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    setFlyDuration(1.5)
    setMarkerPos([lat, lng])
    setAddress(parseAddress(result.address))
    setSearchQuery(result.display_name.split(',').slice(0, 2).join(','))
    setShowDropdown(false)
    setSearchResults([])
  }

  function handleConfirm() {
    if (!address) return
    onConfirm(address)
    handleClose()
  }

  function handleClose() {
    setMarkerPos(null)
    setAddress(null)
    setSearchQuery('')
    setSearchResults([])
    setShowDropdown(false)
    onClose()
  }

  const addressPreview = address
    ? [address.street, address.city, address.state, address.postcode].filter(Boolean).join(', ')
    : null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Pick location on map"
      subtitle="Search or click on the map to select a location"
      maxWidth="max-w-3xl"
      footer={
        <div className="flex items-center justify-between w-full gap-4">
          <p className="text-[12px] text-text-muted truncate flex-1 min-w-0">
            {isGeocoding ? 'Looking up address…' : (addressPreview ?? 'No location selected yet')}
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="h-[38px] px-4 rounded-lg border border-slate-300 text-sm font-semibold text-text-base hover:bg-surface-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!address || isGeocoding}
              className="h-[38px] px-4 rounded-lg bg-brand-700 text-white text-sm font-semibold hover:bg-brand-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
            >
              <Icons.pin size={14} color="white" />
              Use this location
            </button>
          </div>
        </div>
      }
    >
      {/* Search box */}
      <div className="relative">
        <Icons.search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true) }}
          placeholder="Search for an address in Malaysia…"
          className="w-full h-[38px] pl-9 pr-10 border border-slate-200 rounded-lg text-[13.5px] text-text-base bg-white outline-none focus:border-brand-700 focus:ring-[3px] focus:ring-brand-700/10 transition-all"
          autoComplete="off"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-brand-700 border-t-transparent animate-spin" />
        )}

        {showDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-[9999] bg-white border border-slate-200 rounded-lg shadow-xl mt-1 overflow-hidden">
            {searchResults.map((r, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={() => handleSelectResult(r)}
                className="w-full text-left px-3 py-2.5 text-[13px] text-text-base hover:bg-surface-2 transition-colors border-b border-slate-100 last:border-0"
              >
                <span className="truncate block">{r.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="h-[400px] rounded-xl overflow-hidden border border-slate-200 relative">
        <p className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[400] bg-white/90 backdrop-blur-sm text-[11.5px] text-text-muted px-3 py-1 rounded-full border border-slate-200 pointer-events-none whitespace-nowrap">
          Click anywhere on the map to drop a pin
        </p>
        {isOpen && (
          <MapContainer
            center={MALAYSIA_CENTER}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <ClickHandler onMapClick={handleMapClick} />
            <FlyToMarker position={markerPos} duration={flyDuration} />
            {markerPos && <Marker position={markerPos} />}
          </MapContainer>
        )}
      </div>
    </Modal>
  )
}
