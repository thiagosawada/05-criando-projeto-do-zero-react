import { GetStaticProps } from 'next';

import Head from 'next/head';
import Link from 'next/link';

import Prismic from '@prismicio/client';

import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';
import { formatDate } from '../utils/formatDate';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const { next_page, results } = postsPagination;

  const [posts, setPosts] = useState<Post[]>(results);
  const [nextPageUrl, setNextPageUrl] = useState(next_page);

  async function handleLoadPosts(): Promise<void> {
    const response = await fetch(nextPageUrl);
    const data = await response.json();

    setNextPageUrl(data.next_page);

    const newPosts = data.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setPosts([...posts, ...newPosts]);
  }

  return (
    <>
      <Head>
        <title>Página Inicial | spacetravelling</title>
      </Head>
      <main>
        <section className={commonStyles.container}>
          {posts.map(post => (
            <div key={post.uid} className={styles.card}>
              <Link href={`/post/${post.uid}`}>
                <a>
                  <h2 className={styles.title}>{post.data.title}</h2>
                </a>
              </Link>
              <p className={styles.subtitle}>{post.data.subtitle}</p>
              <div className={commonStyles.info}>
                <FiCalendar />
                <time>{formatDate(post.first_publication_date)}</time>
                <FiUser />
                <span>{post.data.author}</span>
              </div>
            </div>
          ))}

          {nextPageUrl && (
            <button
              type="button"
              className={styles.loadPosts}
              onClick={handleLoadPosts}
            >
              Carregar mais posts
            </button>
          )}
        </section>
        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1,
      ref: previewData?.ref ?? null,
    }
  );

  const { next_page } = postsResponse;

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page,
    results,
  };

  return {
    props: { postsPagination, preview },
    revalidate: 60 * 60 * 24,
  };
};
