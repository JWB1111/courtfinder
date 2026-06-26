'use server'

export interface GeocodeResult {
  ok: boolean
  lat?: number
  lng?: number
  displayName?: string
  error?: string
}

// Geocode a free-text address via OpenStreetMap Nominatim.
// Server-side so we can send a proper User-Agent (Nominatim usage policy)
// and keep it to one request per user action.
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const query = address.trim()
  if (query.length < 4) {
    return { ok: false, error: 'Bitte eine vollständigere Adresse eingeben.' }
  }

  const url =
    'https://nominatim.openstreetmap.org/search?' +
    new URLSearchParams({
      q: query,
      format: 'json',
      limit: '1',
      countrycodes: 'de',
      addressdetails: '0',
    }).toString()

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'CourtFinder/1.0 (internal admin geocoding; julius.wolf@rwth-aachen.de)',
        'Accept-Language': 'de',
      },
      // Nominatim results are stable enough to cache briefly
      next: { revalidate: 3600 },
    })
    if (!res.ok) return { ok: false, error: `Geocoding-Dienst antwortete mit ${res.status}.` }

    const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>
    if (!data.length) {
      return { ok: false, error: 'Keine Koordinaten gefunden. Bitte Adresse prüfen oder manuell eintragen.' }
    }

    const { lat, lon, display_name } = data[0]
    return {
      ok: true,
      lat: Number(parseFloat(lat).toFixed(6)),
      lng: Number(parseFloat(lon).toFixed(6)),
      displayName: display_name,
    }
  } catch {
    return { ok: false, error: 'Geocoding fehlgeschlagen (Netzwerk). Koordinaten ggf. manuell eintragen.' }
  }
}
