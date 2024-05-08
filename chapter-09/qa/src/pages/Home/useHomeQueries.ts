import { useClient } from '@/graphql/client';
import {
  AnswerDetailSelector,
  QuestionDetailSelector,
  QuestionResponseListSelector,
  QuestionResponseListType,
} from '@/graphql/selectors';
import { useCallback, useEffect, useState } from 'react';

export const useHomeQueries = () => {
  const [topQuestions, setTopQuestions] =
    useState<QuestionResponseListType[]>();
  const [foundQuestions, setFoundQuestions] =
    useState<QuestionResponseListType[]>();
  const [submitValue, setSubmitValue] = useState('');
  const { client } = useClient();
  useEffect(() => {
    client('query')({
      top: QuestionResponseListSelector,
    }).then((r) => {
      setTopQuestions(r.top);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const search = useCallback(
    (q: string) => {
      setSubmitValue(q);
      client('query')({
        search: [
          { query: q },
          {
            question: QuestionDetailSelector,
            bestAnswer: AnswerDetailSelector,
          },
        ],
      }).then((r) => {
        setFoundQuestions(r.search);
      });
    },
    [client],
  );
  return {
    search,
    questions: foundQuestions
      ? {
          questions: foundQuestions,
          title: `Search results for "${submitValue}"`,
        }
      : {
          questions: topQuestions,
          title: 'Top questions from the community',
        },
    submitValue,
  };
};
