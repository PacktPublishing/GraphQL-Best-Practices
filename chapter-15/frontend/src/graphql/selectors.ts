import { FromSelector, Selector } from '@/zeus';

export const ClientSelector = Selector('Client')({
  _id: true,
  createdAt: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
});

export type ClientType = FromSelector<typeof ClientSelector, 'Client'>;

export const SalonProfileSelector = Selector('SalonProfile')({
  _id: true,
  createdAt: true,
  name: true,
  slug: true,
});

export type SalonType = FromSelector<
  typeof SalonProfileSelector,
  'SalonProfile'
>;

export const ServiceClientSelector = Selector('Service')({
  _id: true,
  name: true,
  price: true,
  description: true,
  createdAt: true,
  approximateDurationInMinutes: true,
});

export type ServiceClientType = FromSelector<
  typeof ServiceClientSelector,
  'Service'
>;

export const VisitServiceSelector = Selector('Visit')({
  _id: true,
  createdAt: true,
  whenDateTime: true,
  client: ClientSelector,
  status: true,
  service: ServiceClientSelector,
});

const VisitClientSelector = Selector('Visit')({
  _id: true,
  createdAt: true,
  whenDateTime: true,
  service: ServiceClientSelector,
});

export const SalonClientForSalonSelector = Selector('SalonClient')({
  _id: true,
  client: ClientSelector,
  createdAt: true,
});

export const SalonClientListForClientSelector = Selector('SalonClient')({
  _id: true,
  createdAt: true,
  salon: {
    name: true,
    _id: true,
    slug: true,
    services: ServiceClientSelector,
  },
  visits: [
    { filterDates: { from: new Date().toISOString() } },
    VisitClientSelector,
  ],
});

export type SalonClientListForClientType = FromSelector<
  typeof SalonClientListForClientSelector,
  'SalonClient'
>;
