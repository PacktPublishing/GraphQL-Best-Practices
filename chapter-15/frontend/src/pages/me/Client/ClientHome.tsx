import { clientData } from '@/atoms';
import { Button } from '@/components/ui/button';
import {
  CardDescription,
  CardTitle,
  Card,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SalonClientDetailForClientType } from '@/graphql/selectors';
import ActiveSalon from '@/pages/me/Client/ActiveSalon';
import { useClientQueries } from '@/pages/me/Client/useClientQueries';
import clsx from 'clsx';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';

const ClientHome = () => {
  const [clientDataFromAtom] = useAtom(clientData);
  const { salonClients, registerToSalon, salonClientById } = useClientQueries();
  const [joinSalonSlug, setJoinSalonSlug] = useState('');
  const [activeSalonId, setActiveSalonId] = useState('');
  const [activeSalon, setActiveSalon] =
    useState<SalonClientDetailForClientType>();

  useEffect(() => {
    salonClientById(activeSalonId).then((s) => setActiveSalon(s));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSalonId, setActiveSalon]);

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex flex-col space-y-2">
        <h2 className="font-bold text-xl">
          Hello, {clientDataFromAtom?.firstName} {clientDataFromAtom?.lastName}
        </h2>
        <p>Choose a salon to book a visit or view an existing appointment.</p>
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
        <ActiveSalon
          refetch={() =>
            salonClientById(activeSalonId).then((s) => setActiveSalon(s))
          }
          activeSalon={activeSalon}
        />
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
