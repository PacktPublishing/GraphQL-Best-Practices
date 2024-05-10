import { Button } from '@/components/ui/button';
import { useClient } from '@/graphql/client';
import { Rocket } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const RocketButton = ({
  score,
  _id,
}: {
  score: number;
  _id: string;
}) => {
  const [currentScore, setCurrentScore] = useState(score);
  const { client, isLoggedIn } = useClient();
  const nav = useNavigate();
  const location = useLocation();
  return (
    <Button
      variant={'outline'}
      title={`${currentScore} rockets received. Click to give some rockets`}
      onClick={(e) => {
        e.stopPropagation();
        if (!isLoggedIn) {
          nav(`/auth/login?next=${location.pathname}`);
          return;
        }
        client('mutation')({
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
