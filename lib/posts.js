import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import remark from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'posts');

export function getSortedPostsData() {
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames.map(fileNames => {
        // Remove '.md' from file name to get id
        const id = fileNames.replace(/\.md$/, '');

        // Read markdown file as string
        const fullPath = path.join(postsDirectory, fileNames);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // Use gray-matter to parse the post metadata section
        const matterResult = matter(fileContents);

        return {
            id,
            ...matterResult.data
        };
    });

    return allPostsData.sort((a, b) => {
        if (a.data < b.data) {
            return 1;
        } else {
            return -1;
        }
    });
}

export function getAllPostsIds() {
    const fileNames = fs.readdirSync(postsDirectory);
    // Returns an array that looks like this:
    // [
    //   {
    //     params: {
    //       id: 'ssg-ssr'
    //     }
    //   },
    //   {
    //     params: {
    //       id: 'pre-rendering'
    //     }
    //   }
    // ]
    return fileNames.map(fileNames => {
        return {
            params: {
                id: fileNames.replace(/\.md$/, ''),
            }
        }
    });
    /**
     * Important: The returned list is not just an array of strings.
     * It must be an array of objects that look like the comment above.
     * Each object must have the params key and contain an object with the
     * id key (because we’re using [id] in the file name).
     * Otherwise, getStaticPaths will fail.
     */
}

export async function getPostData(id) {
    const fullPath = path.join(postsDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    // use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Use remark to convert markdown into HTML string
    const processedContent = await remark()
                                    .use(html)
                                    .process(matterResult.content);

    const contentHtml = processedContent.toString();

    // Combine the data with the id
    return {
        id,
        contentHtml,
        ...matterResult.data,
    }
}