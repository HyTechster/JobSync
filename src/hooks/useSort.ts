import { useState, useMemo } from 'react'

export type SortDir = 'asc' | 'desc'

/** Shared sort state + comparator application, used by every sortable table/list
 *  in the app. `comparators` should be a stable, module-level object so the
 *  memoized sort doesn't recompute on every render. */
export function useSort<T, K extends string>(
  items: T[],
  comparators: Record<K, (a: T, b: T) => number>,
  initialKey: K | null = null,
  initialDir: SortDir = 'asc',
) {
  const [sortKey, setSortKey] = useState<K | null>(initialKey)
  const [sortDir, setSortDir] = useState<SortDir>(initialDir)

  function handleSort(key: K) {
    if (sortKey === key) {
      if (sortDir === 'asc') {
        setSortDir('desc')
      } else {
        setSortKey(null)
        setSortDir('asc')
      }
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function setSort(key: K | null, dir: SortDir) {
    setSortKey(key)
    setSortDir(dir)
  }

  const sorted = useMemo(() => {
    if (!sortKey) return items
    const result = [...items].sort(comparators[sortKey])
    return sortDir === 'asc' ? result : result.reverse()
  }, [items, sortKey, sortDir, comparators])

  return { sortKey, sortDir, handleSort, setSort, sorted }
}
