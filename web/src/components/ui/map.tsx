'use client'

import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api'

type MapProps = {
  lat: number
  lng: number
  zoom?: number
  height?: number
}

export default function Map({ lat, lng, zoom = 15, height = 320 }: MapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  })

  if (loadError) return <p>Google Maps の読み込みに失敗しました</p>
  if (!isLoaded) return <p>地図を読み込み中...</p>

  const center = { lat, lng }

  return (
    <GoogleMap
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
      }}
    >
      <Marker position={center} />
    </GoogleMap>
  )
}
