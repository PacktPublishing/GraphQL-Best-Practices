import { FromSelector, Selector } from '@/zeus';

const QuestionBaseSelector = Selector('Question')({
  _id: true,
  score: true,
  title: true,
  createdAt: true,
  user: {
    username: true,
  },
});

const AnswerBaseSelector = Selector('Answer')({
  _id: true,
  content: true,
  score: true,
  createdAt: true,
  user: {
    username: true,
  },
});

export type AnswerBaseType = FromSelector<typeof AnswerBaseSelector, 'Answer'>;

export const AnswerDetailSelector = Selector('Answer')({
  ...AnswerBaseSelector,
  answers: AnswerBaseSelector,
});

export const QuestionDetailSelector = Selector('Question')({
  ...QuestionBaseSelector,
  content: true,
  answers: AnswerBaseSelector,
});

export type QuestionDetailType = FromSelector<
  typeof QuestionDetailSelector,
  'Question'
>;

export const QuestionResponseListSelector = Selector('QuestionsResponse')({
  question: QuestionBaseSelector,
  bestAnswer: AnswerBaseSelector,
});

export type QuestionResponseListType = FromSelector<
  typeof QuestionResponseListSelector,
  'QuestionsResponse'
>;
