import { clientData } from '@/atoms';
import { Button } from '@/components/ui/button';
import {
  CardDescription,
  CardTitle,
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClientQueries } from '@/pages/me/Client/useClientQueries';
import { useAtom } from 'jotai';
import { useMemo, useState } from 'react';

const ClientHome = () => {
  const [clientDataFromAtom] = useAtom(clientData);
  const { salonClients, registerToSalon, createVisit } = useClientQueries();
  const [joinSalonSlug, setJoinSalonSlug] = useState('');
  const [activeSalonId, setActiveSalonId] = useState('');
  const [bookedVisitDateTime, setBookedVisitDateTime] = useState<string>();
  const activeSalon = useMemo(() => {
    return salonClients.find((sc) => sc._id === activeSalonId);
  }, [activeSalonId, salonClients]);

  return (
    <div>
      <h2>
        Hello, ${clientDataFromAtom?.firstName} ${clientDataFromAtom?.lastName}
      </h2>
      <div>
        {salonClients.map((sc) => (
          <Card
            className="cursor-pointer hover:bg-gray-100"
            onClick={() => setActiveSalonId(sc._id)}
            key={sc._id}
          >
            <CardTitle>{sc.salon.name}</CardTitle>
            <CardDescription>{`Joined on:${new Date(sc.createdAt).toDateString()}`}</CardDescription>
          </Card>
        ))}
      </div>
      {activeSalon && (
        <div>
          <h4>{activeSalon.salon.name} services</h4>
          <div className="grid grid-gap-4">
            {activeSalon.salon.services?.map((sv) => (
              <Card key={sv._id}>
                <CardTitle>{sv.name}</CardTitle>
                <CardDescription>{sv.price}$</CardDescription>
                <CardContent>{sv.description}</CardContent>
                <CardFooter>
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
                        whenDateTime: bookedVisitDateTime,
                      });
                    }}
                  >
                    Book a visit
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <h5>Visits</h5>
          {activeSalon.visits.map((v) => (
            <Card key={v._id}>
              <CardTitle>{v.service.name}</CardTitle>
              <CardDescription>{v.service.description}</CardDescription>
            </Card>
          ))}
        </div>
      )}
      <div>
        <h3>Join new salon</h3>
        <Label htmlFor="new-salon">Salon name</Label>
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
