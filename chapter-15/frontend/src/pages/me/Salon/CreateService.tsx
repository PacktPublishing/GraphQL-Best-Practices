import { Button } from '@/components/ui/button';
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSalonQueries } from '@/pages/me/Salon/useSalonQueries';
import { ResolverInputTypes } from '@/zeus';

import { useEffect, useState } from 'react';

const CreateServiceDialog = () => {
  const { createService } = useSalonQueries();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [serviceForm, setServiceForm] =
    useState<Partial<ResolverInputTypes['CreateService']>>();
  useEffect(() => {
    setServiceForm({});
  }, [dialogOpen]);
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create Service</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Service</DialogTitle>
          <DialogDescription>
            Create Service you sell in your salon.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              className="col-span-3"
              value={serviceForm?.name}
              onChange={(e) =>
                setServiceForm((s) => ({ ...s, name: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="desc" className="text-right">
              Description
            </Label>
            <Textarea
              id="desc"
              className="col-span-3"
              value={serviceForm?.description}
              onChange={(e) =>
                setServiceForm((s) => ({ ...s, description: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <Input
              id="price"
              type="number"
              className="col-span-3"
              value={serviceForm?.price?.toString()}
              onChange={(e) =>
                setServiceForm((s) => ({
                  ...s,
                  price: parseFloat(e.target.value),
                }))
              }
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="approximateDurationInMinutes"
              className="text-right"
            >
              Duration
            </Label>
            <Input
              id="approximateDurationInMinutes"
              type="number"
              className="col-span-3"
              value={serviceForm?.approximateDurationInMinutes}
              onChange={(e) =>
                setServiceForm((s) => ({
                  ...s,
                  approximateDurationInMinutes: e.target.value,
                }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={() => {
              if (
                serviceForm?.name &&
                serviceForm.price &&
                serviceForm.approximateDurationInMinutes &&
                serviceForm.description
              ) {
                createService(serviceForm as Required<typeof serviceForm>).then(
                  (r) => {
                    if (r) {
                      setDialogOpen(false);
                    }
                  },
                );
              }
            }}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateServiceDialog;
