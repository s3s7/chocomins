export type GoogleLatLngAccessor = number | (() => number | null | undefined)

export interface GoogleLatLngLike {
  lat?: GoogleLatLngAccessor | null
  lng?: GoogleLatLngAccessor | null
}

export interface GooglePlaceResult {
  id?: string | null
  place_id?: string | null
  displayName?: string | { text?: string | null } | null
  name?: string | null
  formattedAddress?: string | null
  formatted_address?: string | null
  location?: GoogleLatLngLike | null
  geometry?: {
    location?: GoogleLatLngLike | null
  } | null
  fetchFields?: (options: { fields: string[] }) => Promise<void>
}

export interface GooglePlacePrediction {
  toPlace?: () => GooglePlaceResult | undefined
}

export interface PlaceSelectEventDetail {
  place?: GooglePlaceResult
  placePrediction?: GooglePlacePrediction
}

export type PlaceSelectEvent = CustomEvent<PlaceSelectEventDetail>

export type PlaceAutocompleteElement = HTMLElement & {
  placeholder?: string
  value?: string
  getPlace?: () => GooglePlaceResult | null | undefined
}

export type PlaceAutocompleteElementConstructor =
  new () => PlaceAutocompleteElement

export interface GoogleMapsPlacesNamespace {
  PlaceAutocompleteElement?: PlaceAutocompleteElementConstructor
}

export interface GoogleMapsNamespace {
  importLibrary?: (library: 'places') => Promise<unknown>
  places?: GoogleMapsPlacesNamespace
}

declare global {
  interface Window {
    google?: {
      maps?: GoogleMapsNamespace
    }
  }
}

export {}
