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
import { useEffect, useState } from 'react';
import slugify from 'slugify';

const RegisterSalon = () => {
  const [salonFormValues, setSalonFormValues] = useState<
    Partial<ResolverInputTypes['CreateSalon']>
  >({});
  const { registerAsSalon } = useMeQueries();
  useEffect(() => {
    setSalonFormValues((s) => ({
      ...s,
      slug: s.name ? slugify(s.name, { lower: true, trim: true }) : s.slug,
    }));
  }, [salonFormValues.name]);
  return (
    <div>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Create Salon</CardTitle>
          <CardDescription>
            Enter your information to create a salon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Label htmlFor="first_name">Salon name</Label>
            <Input
              id="first_name"
              placeholder="John"
              required
              value={salonFormValues.name}
              onChange={(e) =>
                setSalonFormValues({
                  ...salonFormValues,
                  name: e.target.value,
                })
              }
            />
            <Label htmlFor="slug">My fancy salon</Label>
            <Input
              id="slug"
              placeholder="my-fancy-salon"
              required
              value={salonFormValues.slug}
              onChange={(e) =>
                setSalonFormValues({
                  ...salonFormValues,
                  slug: e.target.value,
                })
              }
            />
            <Button
              type="submit"
              className="w-full"
              onClick={() => {
                if (!salonFormValues.name || !salonFormValues.slug) return;
                registerAsSalon({
                  name: salonFormValues.name,
                  slug: salonFormValues.slug,
                });
              }}
            >
              Create a salon account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterSalon;
