import { QuestionTile } from '@/components/ui/molecules/question';
import { QuestionResponseListType } from '@/graphql/selectors';

export const QuestionList = ({
  questions,
  title,
}: {
  questions: QuestionResponseListType[];
  title: string;
}) => {
  return (
    <div className="space-y-4 flex flex-col">
      <h1 className="scroll-m-20 text-2xl font-bold text-gray-600 tracking-tight lg:text-3xl">
        {title}
      </h1>
      {questions.map((questionResponse) => {
        return (
          <QuestionTile
            questionResponse={questionResponse}
            key={questionResponse.question._id}
          />
        );
      })}
    </div>
  );
};
