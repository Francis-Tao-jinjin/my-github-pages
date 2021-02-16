import Head from 'next/head';
import Layout, {siteTitle} from '../components/layout';
import utilStyles from '../styles/utils.module.css';
import { getSortedPostsData } from '../lib/posts';
import Link from 'next/link'
import Date from '../components/date'

// this fucntion only runs on the server-side.
// It will never run on the client-side.
// It won’t even be included in the JS bundle for the browser
// Tt can only be exported from a page. 
// You can’t export it from non-page files.
export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    }
  };
}

export default function Home({allPostsData}) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>Hi, I'm Francis Tao. I'm a software engineer, Mainly focus on front-end development and webgl, You can explore my GitHub for more infomation</p>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        {/* <ul className={utilStyles.list}> */}
        {/* <div className="lg:flex items-center container mx-auto my-auto"> */}
        <div className="grid grid-cols-1 md:grid-cols-3">
        {allPostsData.map(({ id, date, pic, description, title, keyword }) => (
            // <div className="flex-1 lg:m-4 shadow-md hover:shadow-lg hover:bg-gray-100 rounded-lg bg-white my-12 mx-8" key={id}>
            <div className="m-3 shadow-md hover:shadow-lg hover:bg-gray-100 rounded-lg bg-white" key={id}>
              <Link href={`/posts/${id}`}>
                <div style={{
                  cursor: 'pointer',
                  backgroundImage: 'url(' + pic + ')',
                }} className="overflow-hidden h-60 bg-cover postCoverImg bg-center"></div>
              </Link>
              <div className="p-4">
                <Link href={`/posts/${id}`}>
                  <a className='truncate font-medium text-gray-900 text-lg inline-block m-0 w-full'>{title}</a>
                </Link>
                <h2 className="font-medium text-sm text-indigo-400 tracking-wide mb-1">{keyword}</h2>
                <p className='text-justify text-base text-gray-600'>
                  { description }
                </p>
                <small className={utilStyles.lightText}>
                  <Date dateString={date} />
                </small>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
