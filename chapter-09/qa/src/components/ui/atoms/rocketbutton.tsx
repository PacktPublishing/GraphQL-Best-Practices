import { Button } from "@/components/ui/button";
import { useClient } from "@/graphql/client";
import { Rocket } from "lucide-react";
import { useState } from "react";

export const RocketButton = ({
  score,
  _id,
}: {
  score: number;
  _id: string;
}) => {
  const [currentScore, setCurrentScore] = useState(score);
  const { client } = useClient();
  return (
    <Button
      variant={"outline"}
      title={`${currentScore} rockets received. Click to give some rockets`}
      onClick={(e) => {
        e.stopPropagation();
        client("mutation")({
          user: {
            vote: [{ _id: _id }, true],
          },
        }).then((r) => {
          if (r.user?.vote) {
            setCurrentScore((cs) => cs + 1);
            return;
          }
        });
      }}
    >
      <Rocket className="mr-2" />
      <p>{currentScore}</p>
    </Button>
  );
};
