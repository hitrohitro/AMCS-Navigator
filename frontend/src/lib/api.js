export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:8000'

export async function fetchRouteFromApi(sourceSelection, destinationSelection) {
  const params = new URLSearchParams({
    source_block: sourceSelection.block,
    source_floor: String(sourceSelection.floor),
    dest_block: destinationSelection.block,
    dest_floor: String(destinationSelection.floor),
  })

  const response = await fetch(`${API_BASE_URL}/api/path?${params.toString()}`)

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.detail ?? 'Unable to fetch path from backend API.')
  }

  return response.json()
}
