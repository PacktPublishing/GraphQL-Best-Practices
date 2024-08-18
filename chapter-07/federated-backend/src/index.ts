import { adapter } from '@/src/axolotl.js';
import resolvers from '@/src/resolvers.js';

// This is yoga specific

adapter({ resolvers },{
  yoga:{
    graphiql:{
      defaultQuery:`mutation Register{
  register(username:"artur", password:"password")
}

mutation Login{
  login(username:"artur", password:"password")
}

# Provide token in headers
mutation CreateTodo{
  user{
    createTodo(content:"Finish the book")
  }
}

# Provide token in headers
query ListTodos{
  user{
    todos{
      _id
      content
      done
    }
  }
}

# Provide token in headers
query TodoById{
  user{
    todo(_id:"0.20740602377045465"){
      _id
      content
      done
    }
  }
}

# Provide token in headers
mutation MarkDone{
  user{
    todoOps(_id:"0.20740602377045465"){
      markDone
    }
  }
}`
    }
  }
}).server.listen(4002, () => {
  console.log('LISTENING to ' + 4002);
});
