import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';
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
    const filePath = path.join(process.cwd(), 'app', 'profile', 'profile.md');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    return {
        data: data as ProfileMeta,
        content,
    };
};
