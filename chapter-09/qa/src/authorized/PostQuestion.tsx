import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useClient } from "@/graphql/client";
import { useState } from "react";

const PostQuestion = () => {
  const { client } = useClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <>
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Post your question!</CardTitle>
          <CardDescription>
            Post your question and wait for answers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              required
              placeholder="Question title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Question longer content"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div>
              <Button
                onClick={() => {
                  client("mutation")({
                    user: {
                      postQuestion: [
                        {
                          createQuestion: {
                            content: description,
                            title,
                          },
                        },
                        true,
                      ],
                    },
                  });
                }}
              >
                Post question
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
export default PostQuestion;
