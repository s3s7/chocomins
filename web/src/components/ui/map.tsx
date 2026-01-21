'use client'

import { useEffect, useRef, useState } from 'react'
import { GoogleMap } from '@react-google-maps/api'
import { loadGoogleMapsPlaces } from '@/lib/google-maps'

type MapProps = {
  lat: number
  lng: number
  zoom?: number
  height?: number
}

type MarkerLib = {
  AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement
}

export default function Map({ lat, lng, zoom = 15, height = 320 }: MapProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<unknown>(null)

  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null,
  )
  const mapRef = useRef<google.maps.Map | null>(null)

  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID
  const center = { lat, lng }

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setLoadError(new Error('Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'))
      return
    }

    loadGoogleMapsPlaces(apiKey)
      .then(() => setIsLoaded(true))
      .catch((e) => setLoadError(e))
  }, [])

  // lat/lng が変わったら位置だけ更新（markerが無ければ何もしない）
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.position = { lat, lng }
    }
  }, [lat, lng])

  if (loadError) return <p>Google Maps の読み込みに失敗しました</p>
  if (!isLoaded) return <p>地図を読み込み中...</p>

  return (
    <GoogleMap
      onLoad={async (map) => {
        mapRef.current = map

        const { AdvancedMarkerElement } = (await google.maps.importLibrary(
          'marker',
        )) as unknown as MarkerLib

        // 既存を掃除
        if (markerRef.current) markerRef.current.map = null

        markerRef.current = new AdvancedMarkerElement({
          map,
          position: { lat, lng },
        })
      }}
      onUnmount={() => {
        if (markerRef.current) {
          markerRef.current.map = null
          markerRef.current = null
        }
        mapRef.current = null
      }}
      center={center}
      zoom={zoom}
      mapContainerStyle={{
        width: '100%',
        height: `${height}px`,
        borderRadius: 12,
      }}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        // ✅ ベクター用：Map ID（必須）
        mapId,
      }}
    />
  )
}
