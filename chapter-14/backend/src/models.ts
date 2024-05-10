export enum VisitStatus {
  CREATED = "CREATED",
  CONFIRMED = "CONFIRMED",
  CANCELED = "CANCELED",
  RESCHEDULED = "RESCHEDULED",
  COMPLETED = "COMPLETED"
}
export enum RegistrationError {
  EXISTS_WITH_SAME_NAME = "EXISTS_WITH_SAME_NAME",
  INVALID_SLUG = "INVALID_SLUG",
  INVALID_NAME = "INVALID_NAME"
}
export enum VisitError {
  ALREADY_BOOKED = "ALREADY_BOOKED",
  INVALID_DATE = "INVALID_DATE"
}

export interface CreateSalon {
  name: string;
  slug: string;
}
export interface UpdateSalon {
  name?: string | undefined;
  slug?: string | undefined;
}
export interface DateFilter {
  from: string;
  to?: string | undefined;
}
export interface CreateService {
  approximateDurationInMinutes: string;
  name: string;
  description: string;
  price?: number | undefined;
}
export interface UpdateService {
  approximateDurationInMinutes?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
  price?: number | undefined;
}
export interface CreateVisitFromClient {
  whenDateTime: string;
  serviceId: string;
}
export interface CreateVisitFromAdmin {
  whenDateTime: string;
  serviceId: string;
  userId: string;
}
export interface UpdateVisitFromAdmin {
  whenDateTime?: string | undefined;
  serviceId?: string | undefined;
  userId?: string | undefined;
}
export interface CreateClient {
  firstName: string;
  lastName: string;
  email?: string | undefined;
  phone?: string | undefined;
}
export interface UpdateClient {
  firstName?: string | undefined;
  lastName?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
}
export interface MessageInput {
  message: string;
}

export type Models = {
  ['User']: {
    username: {
      args: Record<string, never>;
    };
    _id: {
      args: Record<string, never>;
    };
    createdAt: {
      args: Record<string, never>;
    };
    updatedAt: {
      args: Record<string, never>;
    };
  };
  ['AuthPayload']: {
    token: {
      args: Record<string, never>;
    };
    user: {
      args: Record<string, never>;
    };
  };
  ['PublicMutation']: {
    register: {
      args: {
        username: string;
        password: string;
      };
    };
    login: {
      args: {
        username: string;
        password: string;
      };
    };
  };
  ['SalonProfile']: {
    name: {
      args: Record<string, never>;
    };
    slug: {
      args: Record<string, never>;
    };
    _id: {
      args: Record<string, never>;
    };
    user: {
      args: Record<string, never>;
    };
    createdAt: {
      args: Record<string, never>;
    };
    updatedAt: {
      args: Record<string, never>;
    };
  };
  ['SalonOps']: {
    createService: {
      args: {
        service: CreateService;
      };
    };
    serviceOps: {
      args: {
        _id: string;
      };
    };
    update: {
      args: {
        salon: UpdateSalon;
      };
    };
    delete: {
      args: Record<string, never>;
    };
    createVisit: {
      args: {
        visit: CreateVisitFromAdmin;
      };
    };
    visitOps: {
      args: {
        _id: string;
      };
    };
    sendMessage: {
      args: {
        salonClientId: string;
        message: MessageInput;
      };
    };
  };
  ['SalonClient']: {
    salon: {
      args: Record<string, never>;
    };
    visits: {
      args: {
        filterDates: DateFilter;
        salonId?: string | undefined;
      };
    };
    _id: {
      args: Record<string, never>;
    };
    createdAt: {
      args: Record<string, never>;
    };
    updatedAt: {
      args: Record<string, never>;
    };
    client: {
      args: Record<string, never>;
    };
    messageThread: {
      args: Record<string, never>;
    };
  };
  ['Visit']: {
    _id: {
      args: Record<string, never>;
    };
    createdAt: {
      args: Record<string, never>;
    };
    updatedAt: {
      args: Record<string, never>;
    };
    service: {
      args: Record<string, never>;
    };
    status: {
      args: Record<string, never>;
    };
    whenDateTime: {
      args: Record<string, never>;
    };
    client: {
      args: Record<string, never>;
    };
  };
  ['SalonQuery']: {
    me: {
      args: Record<string, never>;
    };
    clients: {
      args: Record<string, never>;
    };
    visits: {
      args: {
        filterDates: DateFilter;
      };
    };
    services: {
      args: Record<string, never>;
    };
    analytics: {
      args: {
        filterDates: DateFilter;
      };
    };
  };
  ['Service']: {
    salon: {
      args: Record<string, never>;
    };
    approximateDurationInMinutes: {
      args: Record<string, never>;
    };
    name: {
      args: Record<string, never>;
    };
    description: {
      args: Record<string, never>;
    };
    price: {
      args: Record<string, never>;
    };
    createdAt: {
      args: Record<string, never>;
    };
    updatedAt: {
      args: Record<string, never>;
    };
    _id: {
      args: Record<string, never>;
    };
  };
  ['Query']: {
    salon: {
      args: Record<string, never>;
    };
    client: {
      args: Record<string, never>;
    };
  };
  ['Mutation']: {
    salon: {
      args: Record<string, never>;
    };
    public: {
      args: Record<string, never>;
    };
    user: {
      args: Record<string, never>;
    };
    client: {
      args: Record<string, never>;
    };
  };
  ['ServiceOps']: {
    delete: {
      args: Record<string, never>;
    };
    update: {
      args: {
        service: UpdateService;
      };
    };
  };
  ['VisitOps']: {
    update: {
      args: {
        visit: UpdateVisitFromAdmin;
      };
    };
    delete: {
      args: Record<string, never>;
    };
  };
  ['SalonAnalytics']: {
    visitsPerDay: {
      args: Record<string, never>;
    };
    cashPerDay: {
      args: Record<string, never>;
    };
  };
  ['AnalyticsAmountPerDate']: {
    date: {
      args: Record<string, never>;
    };
    amount: {
      args: Record<string, never>;
    };
  };
  ['ClientQuery']: {
    clients: {
      args: Record<string, never>;
    };
    me: {
      args: Record<string, never>;
    };
  };
  ['UserOps']: {
    registerAsSalon: {
      args: {
        salon: CreateSalon;
      };
    };
    registerAsClient: {
      args: {
        client: CreateClient;
      };
    };
  };
  ['ClientOps']: {
    update: {
      args: {
        client: UpdateClient;
      };
    };
    createVisit: {
      args: {
        visit: CreateVisitFromClient;
      };
    };
    sendMessage: {
      args: {
        salonId: string;
        message: MessageInput;
      };
    };
  };
  ['RegisterResponse']: {
    errors: {
      args: Record<string, never>;
    };
  };
  ['VisitResponse']: {
    errors: {
      args: Record<string, never>;
    };
  };
  ['Message']: {
    createdAt: {
      args: Record<string, never>;
    };
    updatedAt: {
      args: Record<string, never>;
    };
    _id: {
      args: Record<string, never>;
    };
    sender: {
      args: Record<string, never>;
    };
    messageThread: {
      args: Record<string, never>;
    };
    message: {
      args: Record<string, never>;
    };
  };
  ['MessageThread']: {
    salon: {
      args: Record<string, never>;
    };
    client: {
      args: Record<string, never>;
    };
    messages: {
      args: Record<string, never>;
    };
    _id: {
      args: Record<string, never>;
    };
    createdAt: {
      args: Record<string, never>;
    };
    updatedAt: {
      args: Record<string, never>;
    };
  };
  ['Client']: {
    firstName: {
      args: Record<string, never>;
    };
    lastName: {
      args: Record<string, never>;
    };
    email: {
      args: Record<string, never>;
    };
    phone: {
      args: Record<string, never>;
    };
    user: {
      args: Record<string, never>;
    };
    _id: {
      args: Record<string, never>;
    };
    createdAt: {
      args: Record<string, never>;
    };
    updatedAt: {
      args: Record<string, never>;
    };
  };
};
