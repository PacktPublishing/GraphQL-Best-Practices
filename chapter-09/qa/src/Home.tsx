import { QuestionTile } from "@/components/ui/molecules/question";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClient } from "@/graphql/client";
import {
  AnswerDetailSelector,
  QuestionDetailSelector,
  QuestionResponseListSelector,
  QuestionResponseListType,
} from "@/graphql/selectors";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [topQuestions, setTopQuestions] =
    useState<QuestionResponseListType[]>();
  const [foundQuestions, setFoundQuestions] =
    useState<QuestionResponseListType[]>();
  const { client } = useClient();
  const [searchValue, setSearchValue] = useState("");
  const [submitValue, setSubmitValue] = useState("");
  useEffect(() => {
    client("query")({
      top: QuestionResponseListSelector,
    }).then((r) => {
      setTopQuestions(r.top);
    });
  }, []);

  return (
    <div className="flex flex-col space-y-16 container items-center pb-24">
      <div className="space-y-4 flex flex-col w-full items-center pt-[20vh]">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Find an answer
        </h1>
        <div className="flex w-full max-w-md items-center space-x-2">
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            type="text"
            placeholder="Search for question"
          />
          <Button
            onClick={() => {
              setSubmitValue(searchValue);
              client("query")({
                search: [
                  { query: searchValue },
                  {
                    question: QuestionDetailSelector,
                    bestAnswer: AnswerDetailSelector,
                  },
                ],
              }).then((r) => {
                setFoundQuestions(r.search);
              });
            }}
            type="submit"
          >
            Search
          </Button>
        </div>
      </div>
      {!foundQuestions && (
        <div className="space-y-4 flex flex-col">
          <h1 className="scroll-m-20 text-2xl font-bold text-gray-600 tracking-tight lg:text-3xl">
            Top questions from the community
          </h1>
          {topQuestions?.map((questionResponse) => {
            return (
              <QuestionTile
                questionResponse={questionResponse}
                key={questionResponse.question._id}
              />
            );
          })}
        </div>
      )}
      {foundQuestions?.length === 0 && (
        <div className="flex flex-col space-y-2 max-w-md items-end">
          <p className="text-gray-500">{`No results for "${submitValue}". You can create your question and post it here! `}</p>
          <Link to="/me/post">
            <Button variant={"secondary"}>Post question</Button>
          </Link>
        </div>
      )}
      {foundQuestions?.length && (
        <div className="space-y-4 flex flex-col">
          <h1 className="scroll-m-20 text-2xl font-bold text-gray-600 tracking-tight lg:text-3xl">
            Search results for "{submitValue}"
          </h1>
          {foundQuestions?.map((questionResponse) => {
            return (
              <QuestionTile
                questionResponse={questionResponse}
                key={questionResponse.question._id}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
export default Home;
