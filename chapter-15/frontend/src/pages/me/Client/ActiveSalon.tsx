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
import { SalonClientDetailForClientType } from '@/graphql/selectors';
import { useClientQueries } from '@/pages/me/Client/useClientQueries';
import { useState } from 'react';

const ActiveSalon = ({
  activeSalon,
  refetch,
}: {
  activeSalon: SalonClientDetailForClientType;
  refetch: () => void;
}) => {
  const { createVisit } = useClientQueries();
  const [bookedVisitDateTime, setBookedVisitDateTime] = useState<string>();

  return (
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
      <h4 className="font-bold text-lg">{activeSalon.salon.name} services</h4>
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
                  createVisit(activeSalon._id, {
                    serviceId: sv._id,
                    whenDateTime: new Date(bookedVisitDateTime).toISOString(),
                  }).then((r) => {
                    if (!r) {
                      refetch();
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
  );
};

export default ActiveSalon;
