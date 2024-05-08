import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useQuestion } from '@/pages/Question/useQuestionQuery';
import { useEffect, useState } from 'react';

export const AnswerForm = ({
  questionId,
  answerToId,
  cancel,
}: {
  questionId: string;
  answerToId: string;
  cancel: () => void;
}) => {
  const [answerContent, setAnswerContent] = useState('');
  const { answer } = useQuestion(questionId);
  useEffect(() => {
    setAnswerContent('');
  }, [answerToId]);
  return (
    <div className="w-full flex flex-col max-w-md m-auto space-y-4 pt-[20vh] pb-24">
      <div className="flex flex-col space-y-4">
        <Textarea
          placeholder="write"
          value={answerContent}
          onChange={(e) => setAnswerContent(e.target.value)}
        />
        <div className="flex space-x-4 justify-end">
          <Button onClick={() => cancel()} variant={'ghost'}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              answer(questionId, answerToId, answerContent);
            }}
          >
            Answer
          </Button>
        </div>
      </div>
    </div>
  );
};
