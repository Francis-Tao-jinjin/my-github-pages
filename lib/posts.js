import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
const hljs = require('highlight.js');
const MarkdownIt = require('markdown-it')({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str).value;
            } catch (__) {}
        }
        return ''; // use external default escaping
    }
});


// const showdown = require('showdown');
// const converter = new showdown.Converter();
// converter.setOption('smartIndentationFix', true);

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
        if (a.date < b.date) {
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
    const contentHtml = MarkdownIt.render(matterResult.content);
    // Use remark to convert markdown into HTML string
    // const processedContent = await remark()
    //                                 .use(html)
    //                                 .process(matterResult.content);
    // Combine the data with the id
    return {
        id,
        contentHtml,
        ...matterResult.data,
    }
}