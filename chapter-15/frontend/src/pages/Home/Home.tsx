import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col space-y-16 container items-center pb-24">
      <div className="space-y-4 flex flex-col w-full items-center pt-[20vh]">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Select your path
        </h1>
        <div className="flex w-full max-w-md items-center space-x-2">
          <Link to="/me/client">
            <Button type="submit">Client</Button>
          </Link>
          <Link to="/me/salon">
            <Button type="submit">Salon</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Home;
