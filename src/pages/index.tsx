import { GetStaticProps } from 'next';

import Head from 'next/head';

import Prismic from '@prismicio/client';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';

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
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  return (
    <>
      <Head>
        <title>Página Inicial | spacetravelling</title>
      </Head>
      <main>
        <section>
          <div>
            <h2>Título do post</h2>
            <h3>Conteúdo do post</h3>
            <div>
              <time>Data</time>
              <span>Autor</span>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1,
    }
  );

  const { next_page } = postsResponse;

  const results = postsResponse.results.map(post => {
    const first_publication_date = format(
      new Date(post.first_publication_date),
      'dd MMM y',
      {
        locale: ptBR,
      }
    );

    return {
      uid: post.uid,
      first_publication_date,
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
    props: { postsPagination },
  };
};
