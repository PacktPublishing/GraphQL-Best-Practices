import { RocketButton } from "@/components/ui/atoms/rocketbutton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useClient } from "@/graphql/client";
import {
  QuestionDetailSelector,
  QuestionDetailType,
} from "@/graphql/selectors";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Question = () => {
  const params = useParams();
  const [answeringTo, setAnsweringTo] = useState<{
    to: string;
    text: string;
  }>();
  const [state, setState] = useState<"loading" | "404" | "loaded">("loading");
  const [currentQuestion, setCurrentQuestion] = useState<QuestionDetailType>();
  const { client } = useClient();
  const questionId = params.questionId as string | undefined;

  const fetchQuestion = useCallback(() => {
    if (!questionId) {
      setState("404");
      return;
    }
    client("query")({
      question: [{ _id: questionId }, QuestionDetailSelector],
    })
      .then((q) => {
        setCurrentQuestion(q.question);
        if (!q.question) setState("404");
        else setState("loaded");
      })
      .catch(() => {
        setState("404");
      });
  }, []);

  const answer = useCallback(() => {
    if (!answeringTo) return;
    client("mutation")({
      user: {
        postAnswer: [
          {
            createAnswer: {
              content: answeringTo.text,
              to: answeringTo.to,
            },
          },
          true,
        ],
      },
    }).then((r) => {
      if (r.user?.postAnswer) {
        setAnsweringTo(undefined);
        fetchQuestion();
      }
    });
  }, [client, answeringTo]);

  useEffect(() => {
    fetchQuestion();
  }, [params]);

  if (state === "loading") {
    return (
      <div className="w-full flex flex-col max-w-md m-auto space-y-4">
        <p className="text-center">Loading... please wait</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="w-full flex flex-col max-w-md m-auto space-y-4">
        <p className="text-center">
          404, Question with id {params.questioId} does not exist
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col max-w-md m-auto space-y-4 pt-[20vh] pb-24">
      <div className="flex items-center space-x-2">
        <RocketButton {...currentQuestion} />
        <i>
          On {new Date(currentQuestion.createdAt).toLocaleString()}{" "}
          {currentQuestion.user.username} asked
        </i>
      </div>
      <h2 className="font-extrabold text-3xl">{currentQuestion?.title}</h2>
      <p>{currentQuestion?.content}</p>
      {answeringTo?.to !== currentQuestion._id && (
        <div className="flex justify-end">
          <Button
            onClick={() =>
              setAnsweringTo({
                to: currentQuestion._id,
                text: "",
              })
            }
          >
            Answer
          </Button>
        </div>
      )}
      {answeringTo?.to === currentQuestion._id && (
        <div className="flex flex-col space-y-4">
          <Textarea
            placeholder="write"
            value={answeringTo.text}
            onChange={(e) =>
              setAnsweringTo({
                ...answeringTo,
                text: e.target.value,
              })
            }
          />
          <div className="flex space-x-4 justify-end">
            <Button onClick={() => setAnsweringTo(undefined)} variant={"ghost"}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                answer();
              }}
            >
              Answer
            </Button>
          </div>
        </div>
      )}
      <h3 className="text-lg border-b">Top Answers</h3>
      <div className="flex flex-col space-y-4">
        {currentQuestion.answers.map((a) => (
          <div className="flex flex-col space-y-2">
            <i className="text-gray-400">{`${new Date(a.createdAt).toLocaleString()} ${a.user.username} answered`}</i>
            <div className="text-sm">{a.content}</div>
            <div className="flex justify-end">
              <RocketButton {...a} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Question;
