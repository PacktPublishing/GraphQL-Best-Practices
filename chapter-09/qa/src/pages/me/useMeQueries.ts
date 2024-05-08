import { useClient } from '@/graphql/client';
import { useCallback } from 'react';

export const useMeQueries = () => {
  const { client } = useClient();

  const postQuestion = useCallback(
    (title: string, description: string) => {
      client('mutation')({
        user: {
          postQuestion: [
            {
              createQuestion: {
                content: description,
                title,
              },
            },
            true,
          ],
        },
      });
    },
    [client],
  );

  return { postQuestion };
};
