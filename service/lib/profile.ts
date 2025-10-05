import matter from 'gray-matter';
import { profileMarkdown } from './profileData';
export type ProfileMeta = {
    name: string;
    title: string;
    avatar: string;
    github: string;
};
export type Profile = {
    data: ProfileMeta;
    content: string;
};
export const getProfile = async (): Promise<Profile> => {
    const { data, content } = matter(profileMarkdown);
    return {
        data: data as ProfileMeta,
        content,
    };
};
