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

const ServiceClientSelector = Selector('Service')({
  _id: true,
  name: true,
  price: true,
  description: true,
  approximateDurationInMinutes: true,
});

const VisitClientSelector = Selector('Visit')({
  _id: true,
  createdAt: true,
  whenDateTime: true,
  service: ServiceClientSelector,
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
