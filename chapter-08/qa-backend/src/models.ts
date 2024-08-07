export interface CreateQuestion {
  content: string;
  title: string;
}
export interface CreateAnswer {
  content: string;
  to: string;
}

export type Models = {
  ['Question']: {
    content: {
      args: Record<string, never>;
    };
    score: {
      args: Record<string, never>;
    };
    _id: {
      args: Record<string, never>;
    };
    answers: {
      args: Record<string, never>;
    };
    title: {
      args: Record<string, never>;
    };
    createdAt: {
      args: Record<string, never>;
    };
    updatedAt: {
      args: Record<string, never>;
    };
    user: {
      args: Record<string, never>;
    };
  };
  ['Answer']: {
    content: {
      args: Record<string, never>;
    };
    score: {
      args: Record<string, never>;
    };
    _id: {
      args: Record<string, never>;
    };
    to: {
      args: Record<string, never>;
    };
    createdAt: {
      args: Record<string, never>;
    };
    updatedAt: {
      args: Record<string, never>;
    };
    user: {
      args: Record<string, never>;
    };
    answers: {
      args: Record<string, never>;
    };
  };
  ['Query']: {
    search: {
      args: {
        query: string;
      };
    };
    top: {
      args: Record<string, never>;
    };
    question: {
      args: {
        _id: string;
      };
    };
    me: {
      args: Record<string, never>;
    };
  };
  ['QuestionsResponse']: {
    question: {
      args: Record<string, never>;
    };
    bestAnswer: {
      args: Record<string, never>;
    };
  };
  ['Mutation']: {
    user: {
      args: Record<string, never>;
    };
    public: {
      args: Record<string, never>;
    };
  };
  ['UserMutation']: {
    postQuestion: {
      args: {
        createQuestion: CreateQuestion;
      };
    };
    postAnswer: {
      args: {
        createAnswer: CreateAnswer;
      };
    };
    vote: {
      args: {
        _id: string;
      };
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
};

export type Directives = unknown;

export interface Message {
  content: string;
  score: number;
  _id: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  answers: Array<Answer>;
}
export interface StringId {
  _id: string;
}
export interface Dated {
  createdAt: string;
  updatedAt: string;
}
export interface Owned {
  user: User;
}

export type ToAnswer = Question | Answer;

export type Scalars = unknown;

export interface Question {
  content: string;
  score: number;
  _id: string;
  answers: Array<Answer>;
  title: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}
export interface Answer {
  content: string;
  score: number;
  _id: string;
  to?: ToAnswer | undefined;
  createdAt: string;
  updatedAt: string;
  user: User;
  answers: Array<Answer>;
}
export interface Query {
  search: Array<QuestionsResponse>;
  top: Array<QuestionsResponse>;
  question?: Question | undefined;
  me: User;
}
export interface QuestionsResponse {
  question: Question;
  bestAnswer?: Answer | undefined;
}
export interface Mutation {
  user?: UserMutation | undefined;
  public?: PublicMutation | undefined;
}
export interface UserMutation {
  postQuestion?: string | undefined;
  postAnswer?: string | undefined;
  vote?: number | undefined;
}
export interface PublicMutation {
  register: AuthPayload;
  login: AuthPayload;
}
export interface User {
  username: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
}
export interface AuthPayload {
  token: string;
  user: User;
}
