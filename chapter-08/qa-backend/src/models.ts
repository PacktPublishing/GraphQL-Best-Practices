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
      args: never;
    };
    score: {
      args: never;
    };
    _id: {
      args: never;
    };
    answers: {
      args: never;
    };
    title: {
      args: never;
    };
    createdAt: {
      args: never;
    };
    updatedAt: {
      args: never;
    };
    user: {
      args: never;
    };
  };
  ['Answer']: {
    content: {
      args: never;
    };
    score: {
      args: never;
    };
    _id: {
      args: never;
    };
    to: {
      args: never;
    };
    createdAt: {
      args: never;
    };
    updatedAt: {
      args: never;
    };
    user: {
      args: never;
    };
    answers: {
      args: never;
    };
  };
  ['Query']: {
    search: {
      args: {
        query: string;
      };
    };
    top: {
      args: never;
    };
    question: {
      args: {
        _id: string;
      };
    };
    me: {
      args: never;
    };
  };
  ['QuestionsResponse']: {
    question: {
      args: never;
    };
    bestAnswer: {
      args: never;
    };
  };
  ['Mutation']: {
    user: {
      args: never;
    };
    public: {
      args: never;
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
      args: never;
    };
    _id: {
      args: never;
    };
    createdAt: {
      args: never;
    };
    updatedAt: {
      args: never;
    };
  };
  ['AuthPayload']: {
    token: {
      args: never;
    };
    user: {
      args: never;
    };
  };
};
