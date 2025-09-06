export type CommentDisplayData = {
    commenterName: string;
    recipeTitle: string;
    commentText: string;
    recipeUrl: string;
}

export type UnsentNotification = {
    id: string;
    comment_id: string;
    recipe_id: string;
    recipient_id: string;
    profiles: {
        display_name: string;
        notification_preferences: {
            recipe_comment_notifications: boolean;
        }
    }
}

export type CommentData = {
    text: string;
    user_id: string;
    recipe_id: string;
    profiles: {
        display_name: string;
    }
    recipes: {
        title: string;
    }
}
