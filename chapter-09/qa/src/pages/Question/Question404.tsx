export const Question404 = ({ questionId }: { questionId: string }) => {
  return (
    <div className="w-full flex flex-col max-w-md m-auto space-y-4">
      <p className="text-center">
        404, Question with id {questionId} does not exist
      </p>
    </div>
  );
};
