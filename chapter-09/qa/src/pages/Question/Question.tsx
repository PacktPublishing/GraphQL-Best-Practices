import { RocketButton } from '@/components/ui/atoms/rocketbutton';
import { Button } from '@/components/ui/button';
import { AnswerForm } from '@/pages/Question/AnswerForm';
import { AnswerTile } from '@/pages/Question/AnswerTile';
import { Question404 } from '@/pages/Question/Question404';
import { useQuestion } from '@/pages/Question/useQuestionQuery';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

const Question = () => {
  const params = useParams();
  const [answeringToId, setAnsweringToId] = useState<string>();
  const questionId = params.questionId as string | undefined;
  const { currentQuestion, loadingState } = useQuestion(questionId);
  if (loadingState === 'loading') {
    return (
      <div className="w-full flex flex-col max-w-md m-auto space-y-4">
        <p className="text-center">Loading... please wait</p>
      </div>
    );
  }
  if (loadingState === '404' || !currentQuestion) {
    return <Question404 questionId={questionId || 'no question id'} />;
  }
  return (
    <div className="w-full flex flex-col max-w-md m-auto space-y-4 pt-[20vh] pb-24">
      <div className="flex items-center space-x-2">
        <RocketButton {...currentQuestion} />
        <i>
          On {new Date(currentQuestion.createdAt).toLocaleString()}{' '}
          {currentQuestion.user.username} asked
        </i>
      </div>
      <h2 className="font-extrabold text-3xl">{currentQuestion?.title}</h2>
      <p>{currentQuestion?.content}</p>
      {answeringToId !== currentQuestion._id && (
        <div className="flex justify-end">
          <Button onClick={() => setAnsweringToId(currentQuestion._id)}>
            Answer
          </Button>
        </div>
      )}
      {answeringToId === currentQuestion._id && (
        <AnswerForm
          questionId={currentQuestion._id}
          answerToId={answeringToId}
          cancel={() => setAnsweringToId(undefined)}
        />
      )}
      <h3 className="text-lg border-b">Top Answers</h3>
      <div className="flex flex-col space-y-4">
        {currentQuestion.answers.map((a) => (
          <AnswerTile key={a._id} answer={a} />
        ))}
      </div>
    </div>
  );
};

export default Question;
