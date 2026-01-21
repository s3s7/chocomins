'use client'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useActionState, useState, useRef } from 'react'
import { createReview } from '@/app/actions/review/create'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ReviewInput, reviewSchema } from '@/schemas/review'
import { startTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getErrorMessage } from '@/lib/error-messages'
import { Rating, RatingButton } from '@/components/ui/shadcn-io/rating'
import { loadGoogleMapsPlaces } from '@/lib/google-maps'
import type {
  GooglePlaceResult,
  PlaceAutocompleteElement,
  PlaceSelectEvent,
} from '@/types/google-maps'

type ChocolateOption = {
  id: string
  name: string
}

type FetchFieldsArgs = { fields: string[] }

type PlaceLike = {
  fetchFields?: (args: FetchFieldsArgs) => Promise<void>
}

type PlacePredictionLike = {
  toPlace: () => PlaceLike
}

// gmp-select の event は実装によって placePrediction が直 or detail に入る
type GmpSelectEventLike = Event & {
  placePrediction?: PlacePredictionLike
  detail?: {
    placePrediction?: PlacePredictionLike
  }
}

export const ReviewForm = () => {
  const [state, dispatch, isPending] = useActionState(createReview, null)
  const [chocolateOptions, setChocolateOptions] = useState<ChocolateOption[]>(
    [],
  )
  const [chocolateLoading, setChocolateLoading] = useState(true)
  const [gmapsReady, setGmapsReady] = useState(false)
  const [placeElementReady, setPlaceElementReady] = useState(false)
  const [placeSelection, setPlaceSelection] = useState<{
    googlePlaceId?: string
    placeName?: string
    address?: string
    lat?: string
    lng?: string
  }>({})
  const placeElementContainerRef = useRef<HTMLDivElement | null>(null)
  const placeElementInstanceRef = useRef<PlaceAutocompleteElement | null>(null)
  const router = useRouter()

  const form = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      title: '',
      content: '',
      mintiness: 0,
      chocolateId: '',
      address: '',
    },
  })

  const onSubmit = (values: ReviewInput) => {
    const formData = new FormData()
    formData.append('title', values.title)
    formData.append('content', values.content)
    formData.append('mintiness', String(values.mintiness))
    formData.append('chocolateId', values.chocolateId)
    if (placeSelection.googlePlaceId) {
      formData.append('googlePlaceId', placeSelection.googlePlaceId as string)
    }
    if (placeSelection.placeName) {
      formData.append('placeName', placeSelection.placeName as string)
    }
    const addressToSend = placeSelection.address ?? values.address
    if (typeof addressToSend === 'string' && addressToSend.length > 0) {
      formData.append('address', addressToSend)
    }
    if (placeSelection.lat) formData.append('lat', placeSelection.lat as string)
    if (placeSelection.lng) formData.append('lng', placeSelection.lng as string)

    startTransition(() => {
      dispatch(formData)
    })
  }

  useEffect(() => {
    if (!state) return

    if (state.isSuccess) {
      form.reset()
      toast.success('投稿が完了しました！')
      router.push('/reviews')
    } else {
      toast.error(getErrorMessage(state.errorCode))
    }
  }, [state, form, router])

  useEffect(() => {
    const fetchChocolates = async () => {
      try {
        const response = await fetch('/api/chocolates', { cache: 'no-store' })
        if (!response.ok) throw new Error('Failed to fetch chocolates')
        const data = await response.json()
        setChocolateOptions(data.chocolates ?? [])
      } catch (error) {
        console.error('Failed to load chocolates', error)
        toast.error('チョコレート一覧の取得に失敗しました')
      } finally {
        setChocolateLoading(false)
      }
    }
    fetchChocolates()
  }, [])

  // Google Maps Placesを読み込み、住所入力にオートコンプリートを適用
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) return

    // 新コンポーネントのshadow DOM内inputにid/name/aria-labelledbyを付与
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
      // 初回試行
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
          setPlaceSelection({
            googlePlaceId:
              toNonEmptyString(place.id ?? undefined) ??
              toNonEmptyString(place.place_id ?? undefined),
            placeName: derivePlaceName(place),
            address: formatted,
            lat: typeof lat === 'number' ? String(lat) : undefined,
            lng: typeof lng === 'number' ? String(lng) : undefined,
          })
        }
        // placesが未定義でも、新API/ECLが利用可能な場合は続行

        // 1) 推奨: PlaceAutocompleteElement（ネイティブ要素）
        if (
          placeElementContainerRef.current &&
          !placeElementInstanceRef.current
        ) {
          const NativePlaceEl =
            window.google?.maps?.places?.PlaceAutocompleteElement
          if (NativePlaceEl) {
            try {
              const el = new NativePlaceEl()
              el.placeholder = '場所を検索'
              el.setAttribute('aria-label', '場所を検索')
              // name属性を付与（フォーム項目として送信可能に）
              try {
                el.setAttribute('name', 'address')
              } catch {}
              try {
                el.id = 'place-search-element'
                el.setAttribute('aria-labelledby', 'place-search-label')
                el.setAttribute('name', 'place')
              } catch {}
              // 既存値反映
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

                  // applyPlaceResult は既存の GooglePlaceResult 期待なので最後に1回だけキャスト
                  applyPlaceResult(place as unknown as GooglePlaceResult)
                })()
              }

              el.addEventListener('gmp-select', handlerSelect)
              placeElementContainerRef.current.appendChild(el)
              // 内部の実inputにid/name/aria-labelledbyを設定（可能な場合）
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

        // 2) 公式Webコンポーネント: gmp-place-autocomplete
        if (
          placeElementContainerRef.current &&
          !placeElementInstanceRef.current
        ) {
          try {
            const el = document.createElement(
              'gmp-place-autocomplete',
            ) as PlaceAutocompleteElement
            el.placeholder = '住所を入力して候補から選択'
            el.setAttribute('aria-label', '場所を検索')
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
            // 内部の実inputにid/name/aria-labelledbyを設定（可能な場合）
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
  }, [form])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 rounded-md border p-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>タイトル</FormLabel>
              <FormControl>
                <Input placeholder="タイトルを入力" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel id="place-search-label" htmlFor="place-search-field">
                場所を検索（任意）
              </FormLabel>

              <FormControl>
                {!placeElementReady ? (
                  <Input
                    id="place-search-field"
                    type="search"
                    aria-label="場所を検索"
                    placeholder={
                      gmapsReady ? '住所を入力（候補表示）' : '住所を入力'
                    }
                    className="text-foreground bg-white"
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
        <FormField
          control={form.control}
          name="chocolateId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>チョコレート</FormLabel>
              <Select
                name={field.name}
                onValueChange={field.onChange}
                value={field.value}
                disabled={
                  isPending || chocolateLoading || chocolateOptions.length === 0
                }
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        chocolateLoading ? '取得中...' : '選択してください'
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {chocolateOptions.length === 0 ? (
                    <div className="text-muted-foreground px-2 py-2 text-sm">
                      チョコレートが登録されていません
                    </div>
                  ) : (
                    chocolateOptions.map((chocolate) => (
                      <SelectItem key={chocolate.id} value={chocolate.id}>
                        {chocolate.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                登録済みのチョコレートから選択してください
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>本文</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="本文を入力" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mintiness"
          render={({ field }) => {
            const mintinessValue = field.value ?? 0

            return (
              <FormItem>
                <FormLabel>ミント感</FormLabel>
                <FormControl>
                  <input
                    type="number"
                    name={field.name}
                    value={mintinessValue}
                    readOnly
                    ref={field.ref}
                    className="sr-only"
                  />
                </FormControl>
                <div className="flex flex-col items-center gap-3">
                  <Rating
                    aria-label="ミント感"
                    value={mintinessValue}
                    onValueChange={field.onChange}
                  >
                    {Array.from({ length: 5 }).map((_, index) => (
                      <RatingButton key={index} />
                    ))}
                  </Rating>
                  <span className="text-muted-foreground text-xs">
                    ミント感: {mintinessValue}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )
          }}
        />

        {/* <div className="flex flex-col items-center gap-3">
          <Rating defaultValue={3}>
            {Array.from({ length: 5 }).map((_, index) => (
              <RatingButton key={index} />
            ))}
          </Rating>
          <span className="text-muted-foreground text-xs">ミント感</span>
        </div> */}

        <Button type="submit" disabled={isPending}>
          {isPending ? '投稿中...' : '投稿'}
        </Button>
      </form>
    </Form>
  )
}
