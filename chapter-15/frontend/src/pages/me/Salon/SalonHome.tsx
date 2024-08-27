import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import CreateServiceDialog from '@/pages/me/Salon/CreateService';
import { useSalonQueries } from '@/pages/me/Salon/useSalonQueries';
import { Trash } from 'lucide-react';
import { useEffect } from 'react';

const SalonHome = () => {
  const { fetchMe, mySalon, deleteService, createService } = useSalonQueries();

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <div className="flex flex-col items-start space-y-4">
      <h2 className="text-lg">
        Hello, {mySalon?.me.name} - your slug: <b>{mySalon?.me?.slug}</b>
      </h2>
      <div className="flex space-x-4">
        <CreateServiceDialog createService={createService} />
      </div>
      <div className="flex flex-col w-full space-y-2">
        <h3>My visits</h3>
        <div className="grid grid-cols-3 w-full gap-4">
          {mySalon?.visits.map((v) => (
            <Card key={v._id}>
              <CardHeader>
                <CardTitle>{`${new Date(v.whenDateTime).toLocaleString()} - ${v.client.firstName} ${v.client.lastName}`}</CardTitle>
                <CardDescription>{v.status}</CardDescription>
              </CardHeader>
              <CardContent>{v.service.name}</CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="flex flex-col w-full space-y-2">
        <h3>My services</h3>
        <div className="grid grid-cols-3 w-full gap-4">
          {mySalon?.me?.services?.map((s) => (
            <Card key={s._id}>
              <CardHeader>
                <CardTitle>{s.name}</CardTitle>
                <CardDescription>{s.price}</CardDescription>
              </CardHeader>
              <CardContent>{s.description}</CardContent>
              <CardFooter>
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteService(s._id);
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      <div className="flex flex-col w-full space-y-2">
        <h3>My clients</h3>
        <div className="grid grid-cols-3 w-full gap-4">
          {mySalon?.clients.map((v) => (
            <Card key={v._id}>
              <CardHeader>
                <CardTitle>{`${v.client.firstName} ${v.client.lastName}`}</CardTitle>
                <CardDescription>{`Joined ${new Date(v.createdAt).toLocaleString()}`}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalonHome;
