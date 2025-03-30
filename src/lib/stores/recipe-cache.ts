import { GeneratedRecipe } from "../types"

/**
 * Simple LRU Cache implementation for storing generated recipes
 */
class LRUCache<K, V> {
  private capacity: number
  private cache: Map<K, V>

  constructor(capacity: number) {
    this.capacity = capacity
    this.cache = new Map<K, V>()
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined
    }

    // Get the value and refresh it in the cache
    const value = this.cache.get(key)
    this.cache.delete(key)
    if (value !== undefined) {
      this.cache.set(key, value)
    }
    return value
  }

  set(key: K, value: V): void {
    // Remove the key if it exists to refresh its position
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    // Evict the oldest item if cache is at capacity
    else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey)
      }
    }
    // Add new item
    this.cache.set(key, value)
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  clear(): void {
    this.cache.clear()
  }

  get size(): number {
    return this.cache.size
  }
}

// Export a singleton instance of the recipe cache
export const recipeCache = new LRUCache<string, GeneratedRecipe>(100) 