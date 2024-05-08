import { RocketButton } from '@/components/ui/atoms/rocketbutton';
import { AnswerBaseType } from '@/graphql/selectors';

export const AnswerTile = ({ answer }: { answer: AnswerBaseType }) => {
  return (
    <div className="flex flex-col space-y-2">
      <i className="text-gray-400">{`${new Date(answer.createdAt).toLocaleString()} ${answer.user.username} answered`}</i>
      <div className="text-sm">{answer.content}</div>
      <div className="flex justify-end">
        <RocketButton {...answer} />
      </div>
    </div>
  );
};
