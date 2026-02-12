'use client'

import { useEffect, useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { loadGoogleMapsPlaces } from '@/lib/google-maps'
import type { ReviewInput } from '@/schemas/review'
import type {
  GooglePlaceResult,
  PlaceAutocompleteElement,
  PlaceSelectEvent,
} from '@/types/google-maps'

type FetchFieldsArgs = { fields: string[] }

type PlaceLike = {
  fetchFields?: (args: FetchFieldsArgs) => Promise<void>
}

type PlacePredictionLike = {
  toPlace: () => PlaceLike
}

type GmpSelectEventLike = Event & {
  placePrediction?: PlacePredictionLike
  detail?: {
    placePrediction?: PlacePredictionLike
  }
}

export type PlaceSelection = {
  googlePlaceId?: string
  placeName?: string
  address?: string
  lat?: string
  lng?: string
}

type PlaceAutocompleteFieldProps = {
  form: UseFormReturn<ReviewInput>
  onSelectionChange: (selection: PlaceSelection) => void
}

export function PlaceAutocompleteField({
  form,
  onSelectionChange,
}: PlaceAutocompleteFieldProps) {
  const [gmapsReady, setGmapsReady] = useState(false)
  const [placeElementReady, setPlaceElementReady] = useState(false)
  const placeElementContainerRef = useRef<HTMLDivElement | null>(null)
  const placeElementInstanceRef = useRef<PlaceAutocompleteElement | null>(null)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) return

    const patchInnerInput = (host: HTMLElement) => {
      try {
        const root = host.shadowRoot
        if (!root) return false
        const inp = root.querySelector(
          'input[role="combobox"]',
        ) as HTMLInputElement | null
        if (!inp) return false
        if (!inp.id) inp.id = 'place-search'
        if (!inp.name) inp.name = 'place'
        const labelledby = inp.getAttribute('aria-labelledby')
        if (!labelledby || labelledby.trim() === '') {
          inp.setAttribute('aria-labelledby', 'place-search-label')
        }
        return true
      } catch {
        return false
      }
    }

    const observeInnerInput = (host: HTMLElement) => {
      if (patchInnerInput(host)) return
      const root = host.shadowRoot
      if (!root) return
      const mo = new MutationObserver(() => {
        if (patchInnerInput(host)) mo.disconnect()
      })
      mo.observe(root, { childList: true, subtree: true })
      setTimeout(() => mo.disconnect(), 5000)
    }

    loadGoogleMapsPlaces(apiKey)
      .then(() => {
        setGmapsReady(true)
        const toNonEmptyString = (value?: string | null) => {
          if (typeof value === 'string' && value.length > 0) return value
          return undefined
        }
        const normalizeCoordinate = (
          candidate?: number | null | (() => number | null | undefined),
        ) => {
          if (typeof candidate === 'function') {
            try {
              const result = candidate()
              return typeof result === 'number' ? result : undefined
            } catch {
              return undefined
            }
          }
          return typeof candidate === 'number' ? candidate : undefined
        }
        const derivePlaceName = (place?: GooglePlaceResult | null) => {
          if (!place) return undefined
          const displayName = place.displayName
          if (typeof displayName === 'string' && displayName.length > 0) {
            return displayName
          }
          if (
            displayName &&
            typeof displayName === 'object' &&
            'text' in displayName &&
            typeof displayName.text === 'string'
          ) {
            return displayName.text
          }
          return toNonEmptyString(place.name ?? undefined)
        }
        const applyPlaceResult = (place?: GooglePlaceResult | null) => {
          if (!place) return
          const formatted =
            toNonEmptyString(place.formattedAddress ?? undefined) ??
            toNonEmptyString(place.formatted_address ?? undefined)
          const locationSource = place.location ?? place.geometry?.location
          const lat = normalizeCoordinate(locationSource?.lat)
          const lng = normalizeCoordinate(locationSource?.lng)
          if (formatted) {
            form.setValue('address', formatted)
          }
          onSelectionChange({
            googlePlaceId:
              toNonEmptyString(place.id ?? undefined) ??
              toNonEmptyString(place.place_id ?? undefined),
            placeName: derivePlaceName(place),
            address: formatted,
            lat: typeof lat === 'number' ? String(lat) : undefined,
            lng: typeof lng === 'number' ? String(lng) : undefined,
          })
        }

        if (
          placeElementContainerRef.current &&
          !placeElementInstanceRef.current
        ) {
          const NativePlaceEl =
            window.google?.maps?.places?.PlaceAutocompleteElement
          if (NativePlaceEl) {
            try {
              const el = new NativePlaceEl()
              el.placeholder = '場所を登録'
              el.setAttribute('aria-label', '場所を登録')
              try {
                el.setAttribute('name', 'address')
              } catch {}
              try {
                el.id = 'place-search-element'
                el.setAttribute('aria-labelledby', 'place-search-label')
                el.setAttribute('name', 'place')
              } catch {}
              const current = form.getValues('address')
              if (current) {
                try {
                  el.value = current
                } catch {}
              }
              const handlerSelect = (event: Event) => {
                void (async () => {
                  const e = event as GmpSelectEventLike
                  const prediction =
                    e.placePrediction ?? e.detail?.placePrediction
                  if (!prediction) return

                  const place = prediction.toPlace()
                  if (!place) return

                  await place.fetchFields?.({
                    fields: [
                      'id',
                      'displayName',
                      'formattedAddress',
                      'location',
                    ],
                  })

                  applyPlaceResult(place as unknown as GooglePlaceResult)
                })()
              }

              el.addEventListener('gmp-select', handlerSelect)
              placeElementContainerRef.current.appendChild(el)
              observeInnerInput(el)
              placeElementInstanceRef.current = el
              setPlaceElementReady(true)
              return
            } catch (e) {
              console.warn(
                'PlaceAutocompleteElement 初期化失敗、ECLにフォールバックします',
                e,
              )
            }
          }
        }

        if (
          placeElementContainerRef.current &&
          !placeElementInstanceRef.current
        ) {
          try {
            const el = document.createElement(
              'gmp-place-autocomplete',
            ) as PlaceAutocompleteElement
            el.placeholder = '住所を入力して候補から選択'
            el.setAttribute('aria-label', '場所を登録')
            try {
              el.id = 'place-search-element'
              el.setAttribute('aria-labelledby', 'place-search-label')
              el.setAttribute('name', 'place')
            } catch {}
            const current = form.getValues('address')
            if (current) {
              try {
                el.value = current
              } catch {}
            }
            const handlerSelect = (event: Event) => {
              void (async () => {
                try {
                  const detailEvent = event as PlaceSelectEvent
                  const prediction = detailEvent.detail?.placePrediction
                  if (!prediction?.toPlace) return
                  const place = prediction.toPlace()
                  if (!place) return
                  await place.fetchFields?.({
                    fields: [
                      'id',
                      'displayName',
                      'formattedAddress',
                      'location',
                    ],
                  })
                  applyPlaceResult(place)
                } catch {}
              })()
            }
            el.addEventListener('gmp-select', handlerSelect)
            placeElementContainerRef.current.appendChild(el)
            observeInnerInput(el)
            placeElementInstanceRef.current = el
            setPlaceElementReady(true)
            return
          } catch (e) {
            console.warn(
              'gmp-place-autocomplete 初期化失敗、通常入力のみで継続します',
              e,
            )
          }
        }
      })
      .catch((e) => {
        console.warn('Google Mapsの読み込みに失敗しました', e)
      })
  }, [form, onSelectionChange])

  return (
    <FormField
      control={form.control}
      name="address"
      render={({ field }) => (
        <FormItem>
          <FormLabel id="place-search-label" htmlFor="place-search-field">
            場所を登録（任意）
          </FormLabel>

          <FormControl>
            {!placeElementReady ? (
              <Input
                id="place-search-field"
                type="search"
                aria-label="場所を登録"
                placeholder={
                  gmapsReady ? '住所を入力（候補表示）' : '住所を入力'
                }
                {...field}
                autoComplete="off"
              />
            ) : (
              <Input
                id="place-search-field"
                className="sr-only"
                tabIndex={-1}
                {...field}
                readOnly
                autoComplete="street-address"
              />
            )}
          </FormControl>

          <div
            ref={placeElementContainerRef}
            className={`rounded-md border bg-white ${placeElementReady ? 'block' : 'hidden'}`}
          />

          <FormMessage />
        </FormItem>
      )}
    />
  )
}
