import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = import.meta.env.VITE_MAP_TOKEN

export default function MapView({ geometry, title, location }) {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (mapRef.current || !geometry?.coordinates) return

    const [lng, lat] = geometry.coordinates

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [lng, lat],
      zoom: 9,
    })

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Popup
    new mapboxgl.Marker({ color: '#f43f5e' })
      .setLngLat([lng, lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<strong class="text-slate-800">${title}</strong><br/><span class="text-slate-500 text-sm">${location}</span>`
        )
      )
      .addTo(mapRef.current)

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [geometry, title, location])

  if (!geometry?.coordinates) {
    return (
      <div className="h-64 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-sm">
        Map unavailable
      </div>
    )
  }

  return (
    <div
      ref={mapContainer}
      className="h-72 rounded-2xl overflow-hidden shadow-sm border border-slate-100"
    />
  )
}
