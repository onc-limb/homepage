import matter from "gray-matter"
// @ts-expect-error raw-loader returns string
import profileMarkdown from "../docs/profile.md"
export type ProfileMeta = {
    name: string
    title: string
    avatar: string
    github: string
}
export type Profile = {
    data: ProfileMeta
    content: string
}
export const getProfile = async (): Promise<Profile> => {
    const { data, content } = matter(profileMarkdown)
    return {
        data: data as ProfileMeta,
        content,
    }
}
