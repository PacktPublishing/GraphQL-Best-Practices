import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMeQueries } from '@/pages/me/useMeQueries';
import { ResolverInputTypes } from '@/zeus';
import { useState } from 'react';

const RegisterClient = () => {
  const [clientFormValues, setClientFormValues] = useState<
    Partial<ResolverInputTypes['CreateClient']>
  >({});
  const { registerAsClient } = useMeQueries();
  return (
    <div>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Label htmlFor="first_name">First name</Label>
            <Input
              id="first_name"
              placeholder="John"
              required
              value={clientFormValues.firstName}
              onChange={(e) =>
                setClientFormValues({
                  ...clientFormValues,
                  firstName: e.target.value,
                })
              }
            />
            <Label htmlFor="last_name">Last name</Label>
            <Input
              id="last_name"
              placeholder="Duff"
              required
              value={clientFormValues.lastName}
              onChange={(e) =>
                setClientFormValues({
                  ...clientFormValues,
                  lastName: e.target.value,
                })
              }
            />
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="homer@example.com"
              required
              value={clientFormValues.lastName}
              onChange={(e) =>
                setClientFormValues({
                  ...clientFormValues,
                  lastName: e.target.value,
                })
              }
            />
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+00123456"
              required
              value={clientFormValues.lastName}
              onChange={(e) =>
                setClientFormValues({
                  ...clientFormValues,
                  lastName: e.target.value,
                })
              }
            />
            <Button
              type="submit"
              className="w-full"
              onClick={() => {
                if (!clientFormValues.firstName || !clientFormValues.lastName)
                  return;
                registerAsClient(
                  clientFormValues as ResolverInputTypes['CreateClient'],
                );
              }}
            >
              Create a client account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterClient;
