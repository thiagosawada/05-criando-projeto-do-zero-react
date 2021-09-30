import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { formatDate } from '../../utils/formatDate';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
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

function countWords(text: string): number {
  return text.split(/\s+/g).length;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div className={commonStyles.container}>Carregando...</div>;
  }

  function readingTime(): number {
    const totalWords = post.data.content.reduce((acc, ct) => {
      let counter = acc;
      counter += countWords(ct.heading);
      counter += countWords(RichText.asText(ct.body));
      return counter;
    }, 0);

    return Math.ceil(totalWords / 200);
  }

  return (
    <>
      <div
        className={styles.banner}
        style={{ backgroundImage: `url(${post.data.banner.url})` }}
      />
      <div className={commonStyles.container}>
        <h1>{post.data.title}</h1>
        <div>
          <time>{formatDate(post.first_publication_date)}</time>
          <span>{post.data.author}</span>
          <span>{readingTime()} min</span>
        </div>
        {post.data.content.map((ct, index) => (
          <div key={`ct-${index + 1}`}>
            <h2>{ct.heading}</h2>
            <div
              dangerouslySetInnerHTML={{ __html: RichText.asHtml(ct.body) }}
            />
          </div>
        ))}
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

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return { props: { post } };
};
