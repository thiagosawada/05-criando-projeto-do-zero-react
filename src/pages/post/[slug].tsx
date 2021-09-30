import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div className={commonStyles.container}>Carregando...</div>;
  }

  return (
    <>
      <div className={commonStyles.container}>
        <h1>Hello world!</h1>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const { results } = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      orderings: '[posts.last_publication_date]',
      pageSize: 1,
    }
  );

  const paths = results.map(result => ({ params: { slug: result.uid } }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const content = response.data.content.map(ct => {
    return {
      heading: ct.heading,
      body: {
        text: RichText.asHtml(ct.body),
      },
    };
  });

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content,
    },
  };

  return { props: { post } };
};
