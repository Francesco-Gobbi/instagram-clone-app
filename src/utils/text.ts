// All static text

export type ListType = Record<string, Record<string,string>>

export const LIST: ListType = {
    home: {
        noPosts: "No posts available.",
        refresh: "Pull down to refresh.",
        loading: "Loading posts...",
    },
    stories: {
        video: "Your Story",
        addToVideo: "Add to your story",
        newVideo: "New Story"
    }
};
