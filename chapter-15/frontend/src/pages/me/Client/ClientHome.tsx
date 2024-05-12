import { clientData } from '@/atoms';
import { Button } from '@/components/ui/button';
import {
  CardDescription,
  CardTitle,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClientQueries } from '@/pages/me/Client/useClientQueries';
import clsx from 'clsx';
import { useAtom } from 'jotai';
import { useMemo, useState } from 'react';

const ClientHome = () => {
  const [clientDataFromAtom] = useAtom(clientData);
  const { salonClients, registerToSalon, createVisit, getSalonClients } =
    useClientQueries();
  const [joinSalonSlug, setJoinSalonSlug] = useState('');
  const [activeSalonId, setActiveSalonId] = useState('');
  const [bookedVisitDateTime, setBookedVisitDateTime] = useState<string>();
  const activeSalon = useMemo(() => {
    return salonClients.find((sc) => sc._id === activeSalonId);
  }, [activeSalonId, salonClients]);
  return (
    <div className="flex flex-col space-y-8">
      <div className="flex flex-col space-y-2">
        <h2 className="font-bold text-xl">
          Hello, {clientDataFromAtom?.firstName} {clientDataFromAtom?.lastName}
        </h2>
        <p>Choose a salon to check your visits or book one</p>
        <div className="grid grid-cols-2 gap-4">
          {salonClients.map((sc) => (
            <Card
              className={clsx(
                'cursor-pointer hover:bg-gray-100',
                sc._id === activeSalonId && 'bg-gray-200',
              )}
              onClick={() => setActiveSalonId(sc._id)}
              key={sc._id}
            >
              <CardHeader>
                <CardTitle>{sc.salon.name}</CardTitle>
                <CardDescription>{`Joined on:${new Date(sc.createdAt).toDateString()}`}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
      {activeSalon && (
        <div className="flex flex-col space-y-4">
          <h5 className="font-bold text-lg">Your Visits</h5>
          {activeSalon.visits.map((v) => (
            <Card key={v._id}>
              <CardHeader>
                <CardTitle>{`${new Date(v.whenDateTime).toLocaleString()} - ${v.service.name}`}</CardTitle>
                <CardDescription>{v.service.price}$</CardDescription>
              </CardHeader>
              <CardContent>{v.service.description}</CardContent>
            </Card>
          ))}
          <h4 className="font-bold text-lg">
            {activeSalon.salon.name} services
          </h4>
          <div className="grid grid-cols-2  gap-4">
            {activeSalon.salon.services?.map((sv) => (
              <Card key={sv._id}>
                <CardHeader>
                  <CardTitle>{sv.name}</CardTitle>
                  <CardDescription>{sv.price}$</CardDescription>
                </CardHeader>
                <CardContent>{sv.description}</CardContent>
                <CardFooter className="space-x-4">
                  <Input
                    type="datetime-local"
                    value={bookedVisitDateTime}
                    onChange={(e) => {
                      setBookedVisitDateTime(e.target.value);
                    }}
                  />
                  <Button
                    onClick={() => {
                      if (!bookedVisitDateTime) return;
                      createVisit({
                        serviceId: sv._id,
                        whenDateTime: new Date(
                          bookedVisitDateTime,
                        ).toISOString(),
                      }).then((r) => {
                        if (!r) {
                          getSalonClients();
                        }
                      });
                    }}
                  >
                    Book a visit
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-col space-y-4">
        <h3>Join new salon</h3>
        <Label htmlFor="new-salon">Salon slug</Label>
        <Input
          id="new-salon"
          name="new-salon"
          value={joinSalonSlug}
          onChange={(e) => setJoinSalonSlug(e.target.value)}
        />
        <Button
          onClick={() => {
            if (joinSalonSlug) {
              registerToSalon(joinSalonSlug);
            }
          }}
        >
          Join
        </Button>
      </div>
    </div>
  );
};

export default ClientHome;
