export interface Recipe {
    id: string
    title: string
    description?: string
    thumbnail: string
    source_url: string
    source_name: string
    n_portions: number
    total_cook_time_minutes: number
    ingredients: Array<{
        name: string
        ingredients: Array<{
            quantity: {
                type: "range"
                low: number
                high: number
            }
            unit: string
            description: string
        }>
    }>
    instructions: string[]
    is_public: boolean
    user_id: string
    status?: "DRAFT" | "PUBLISHED"
    created_at?: string
    is_bookmarked_by_current_user?: boolean
    bookmark_count?: number
    is_liked_by_current_user?: boolean
    like_count?: number
    comment_count?: number
    profiles?: {
        display_name: string | null
        id: string
        avatar?: string | null
    }
}
