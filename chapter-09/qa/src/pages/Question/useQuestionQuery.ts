import { useClient } from '@/graphql/client';
import {
  QuestionDetailSelector,
  QuestionDetailType,
} from '@/graphql/selectors';
import { useCallback, useEffect, useState } from 'react';

export const useQuestion = (questionId: string | undefined) => {
  const [loadingState, setLoadingState] = useState<
    'loading' | '404' | 'loaded'
  >('loading');
  const [currentQuestion, setCurrentQuestion] = useState<QuestionDetailType>();
  const { client } = useClient();

  const fetchQuestion = useCallback(
    (questionId: string) => {
      if (!questionId) {
        setLoadingState('404');
        return;
      }
      client('query')({
        question: [{ _id: questionId }, QuestionDetailSelector],
      })
        .then((q) => {
          setCurrentQuestion(q.question);
          if (!q.question) setLoadingState('404');
          else setLoadingState('loaded');
        })
        .catch(() => {
          setLoadingState('404');
        });
    },
    [client],
  );

  const answer = useCallback(
    (questionId: string, answeringToId: string, text: string) => {
      client('mutation')({
        user: {
          postAnswer: [
            {
              createAnswer: {
                content: text,
                to: answeringToId,
              },
            },
            true,
          ],
        },
      }).then((r) => {
        if (r.user?.postAnswer) {
          fetchQuestion(questionId);
        }
      });
    },
    [client, fetchQuestion],
  );

  useEffect(() => {
    if (questionId) {
      fetchQuestion(questionId);
    } else {
      setLoadingState('404');
    }
  }, [questionId, fetchQuestion]);

  return { answer, currentQuestion, loadingState };
};
