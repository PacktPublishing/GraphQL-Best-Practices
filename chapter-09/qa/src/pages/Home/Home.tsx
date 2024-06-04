import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QuestionList } from '@/pages/Home/QuestionList';
import { useHomeQueries } from '@/pages/Home/useHomeQueries';

const Home = () => {
  const { questions, search, submitValue } = useHomeQueries();
  const [searchValue, setSearchValue] = useState('');
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
              search(searchValue);
            }}
            type="submit"
          >
            Search
          </Button>
        </div>
      </div>
      {questions.questions?.length == 0 && (
        <QuestionList questions={questions.questions} title={questions.title} />
      )}
      {questions.questions?.length === 0 && (
        <div className="flex flex-col space-y-2 max-w-md items-end">
          <p className="text-gray-500">{`No results for "${submitValue}". You can create your question and post it here! `}</p>
          <Link to="/me/post">
            <Button variant={'secondary'}>Post question</Button>
          </Link>
        </div>
      )}
    </div>
  );
};
export default Home;
