import { RocketButton } from "@/components/ui/atoms/rocketbutton";
import { QuestionResponseListType } from "@/graphql/selectors";
import { Link } from "react-router-dom";

export const QuestionTile = ({
  questionResponse: { question, bestAnswer },
}: {
  questionResponse: QuestionResponseListType;
}) => {
  return (
    <div className="border rounded p-4 max-w-md">
      <Link to={`/question/${question._id}`}>
        <div className="space-x-4 ">
          <div>
            <i className="text-gray-400">{`${new Date(question.createdAt).toLocaleString()} ${question.user.username} asked`}</i>
            <div className="text-xl">{question.title}</div>
            {bestAnswer && (
              <>
                <b>Best answer</b>
                <p>{bestAnswer.content.split("s").slice(0, 10).join("s")}...</p>
              </>
            )}
          </div>
        </div>
      </Link>
      <div className="justify-end flex">
        <RocketButton {...question} />
      </div>
    </div>
  );
};
