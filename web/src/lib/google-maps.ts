declare global {
  interface Window {
    google?: any
  }
}

let loaderPromise: Promise<void> | null = null

export function loadGoogleMapsPlaces(apiKey: string) {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.google?.maps?.places) return Promise.resolve()
  if (loaderPromise) return loaderPromise

  loaderPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-google-maps-loader="true"]',
    ) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('load failed')))
      return
    }

    const script = document.createElement('script')
    // Google推奨のloading=async & v=weeklyを付与
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey,
    )}&libraries=places&language=ja&v=weekly&loading=async`
    script.async = true
    script.defer = true
    script.dataset.googleMapsLoader = 'true'
    script.onload = () => {
      try {
        const maps = (window as any).google?.maps
        // importLibraryでplacesを明示ロード（対応ブラウザ/バージョンで有効）
        if (maps?.importLibrary) {
          let resolved = false
          const finalize = () => {
            if (!resolved) {
              resolved = true
              resolve()
            }
          }

          maps
            .importLibrary('places')
            .then(() => {
              // 拡張コンポーネント（gmpx-*）を読み込み（PlaceAutocompleteElementに必要）
              const existingEcl = document.querySelector(
                'script[data-google-maps-ecl="true"]',
              ) as HTMLScriptElement | null
              if (existingEcl) {
                existingEcl.addEventListener('load', finalize)
                existingEcl.addEventListener('error', finalize)
                finalize()
                return
              }
              const ecl = document.createElement('script')
              ecl.type = 'module'
              ecl.src =
                'https://unpkg.com/@googlemaps/extended-component-library@latest'
              ecl.dataset.googleMapsEcl = 'true'
              ecl.onload = finalize
              ecl.onerror = finalize // 読み込みに失敗してもフォールバックできるようにする
              document.head.appendChild(ecl)
            })
            .catch(() => finalize()) // placesロード失敗でも最低限resolve（フォールバック可）
          return
        }
      } catch {}
      // importLibraryがない場合: ECLを読み込み、google.maps.places の出現を短時間ポーリング
      const existingEcl = document.querySelector(
        'script[data-google-maps-ecl="true"]',
      ) as HTMLScriptElement | null
      const finish = () => {
        const start = Date.now()
        const tick = () => {
          if ((window as any).google?.maps?.places) {
            resolve()
            return
          }
          if (Date.now() - start > 4000) {
            // タイムアウトでもresolve（ECL側や新APIが拾える場合あり）
            try { console.warn('[GMAPS] places namespace not detected within timeout') } catch {}
            resolve()
            return
          }
          setTimeout(tick, 100)
        }
        tick()
      }
      if (existingEcl) {
        finish()
        return
      }
      const ecl = document.createElement('script')
      ecl.type = 'module'
      ecl.src = 'https://unpkg.com/@googlemaps/extended-component-library@latest'
      ecl.dataset.googleMapsEcl = 'true'
      ecl.onload = finish
      ecl.onerror = finish
      document.head.appendChild(ecl)
    }
    script.onerror = () => reject(new Error('Failed to load Google Maps JS'))
    document.head.appendChild(script)
  })

  return loaderPromise
}
