import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMeQueries } from '@/pages/me/useMeQueries';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const PostQuestion = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { postQuestion } = useMeQueries();
  const navigate = useNavigate();

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
                onClick={() =>
                  postQuestion(title, description).then(() => {
                    toast('Successfully posted question');
                    navigate('/');
                  })
                }
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
