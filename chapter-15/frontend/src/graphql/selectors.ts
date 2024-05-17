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

export const ServiceSelector = Selector('Service')({
  _id: true,
  name: true,
  price: true,
  description: true,
  createdAt: true,
  approximateDurationInMinutes: true,
});

export type ServiceType = FromSelector<typeof ServiceSelector, 'Service'>;

export const SalonProfileSelector = Selector('SalonProfile')({
  _id: true,
  createdAt: true,
  name: true,
  slug: true,
  services: ServiceSelector,
});

export type SalonType = FromSelector<
  typeof SalonProfileSelector,
  'SalonProfile'
>;

export const VisitSalonSelector = Selector('Visit')({
  _id: true,
  createdAt: true,
  whenDateTime: true,
  client: ClientSelector,
  status: true,
  service: ServiceSelector,
});

export const SalonClientForSalonSelector = Selector('SalonClient')({
  _id: true,
  client: ClientSelector,
  createdAt: true,
});

export const MessagesSelector = Selector('SalonClient')({
  messageThread: {
    messages: {
      message: true,
      createdAt: true,
      sender: {
        __typename: true,
        '...on SalonClient': {
          _id: true,
        },
        '...on SalonProfile': {
          _id: true,
        },
      },
    },
  },
});

export const FullSalonMeQuerySelector = Selector('SalonQuery')({
  me: SalonProfileSelector,
  visits: [
    { filterDates: { from: new Date().toISOString() } },
    VisitSalonSelector,
  ],
  clients: SalonClientForSalonSelector,
});

export type FullSalonMeQueryType = FromSelector<
  typeof FullSalonMeQuerySelector,
  'SalonQuery'
>;

const VisitClientSelector = Selector('Visit')({
  _id: true,
  createdAt: true,
  whenDateTime: true,
  service: ServiceSelector,
});

export const SalonClientListForClientSelector = Selector('SalonClient')({
  _id: true,
  createdAt: true,
  salon: {
    name: true,
    _id: true,
    slug: true,
  },
});

export type SalonClientListForClientType = FromSelector<
  typeof SalonClientListForClientSelector,
  'SalonClient'
>;

export const SalonClientDetailForClientSelector = Selector('SalonClient')({
  _id: true,
  createdAt: true,
  salon: {
    name: true,
    _id: true,
    slug: true,
    services: ServiceSelector,
  },
  visits: [
    { filterDates: { from: new Date().toISOString() } },
    VisitClientSelector,
  ],
});

export type SalonClientDetailForClientType = FromSelector<
  typeof SalonClientDetailForClientSelector,
  'SalonClient'
>;

export const MessagesForSalonClientSelector = Selector('SalonClient')({
  messageThread: {
    messages: {
      message: true,
      createdAt: true,
      sender: {
        __typename: true,
        '...on SalonClient': {
          _id: true,
        },
        '...on SalonProfile': {
          _id: true,
          name: true,
        },
      },
    },
  },
});
