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

export async function fetchTimetableOptions(filters = {}) {
  const params = new URLSearchParams()

  if (filters.programme) {
    params.set('programme', filters.programme)
  }

  const query = params.toString()
  const endpoint = query
    ? `${API_BASE_URL}/api/timetable/options?${query}`
    : `${API_BASE_URL}/api/timetable/options`

  const response = await fetch(endpoint)

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.detail ?? 'Unable to fetch timetable options.')
  }

  return response.json()
}

export async function fetchTimetableFromApi(filters = {}) {
  const params = new URLSearchParams()

  if (filters.semesterId) {
    params.set('semester_id', filters.semesterId)
  } else if (filters.academicYear && filters.term) {
    params.set('academic_year', filters.academicYear)
    params.set('term', filters.term)
  }

  if (filters.programme) {
    params.set('programme', filters.programme)
  }

  if (filters.dayOfWeek) {
    params.set('day_of_week', filters.dayOfWeek)
  }

  const response = await fetch(`${API_BASE_URL}/api/timetable?${params.toString()}`)

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.detail ?? 'Unable to fetch timetable.')
  }

  return response.json()
}
