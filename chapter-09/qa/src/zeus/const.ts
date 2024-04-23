/* eslint-disable */

export const AllTypesProps: Record<string,any> = {
	Query:{
		search:{

		},
		question:{

		}
	},
	UserMutation:{
		postQuestion:{
			createQuestion:"CreateQuestion"
		},
		postAnswer:{
			createAnswer:"CreateAnswer"
		},
		vote:{

		}
	},
	PublicMutation:{
		register:{

		},
		login:{

		}
	},
	CreateQuestion:{

	},
	CreateAnswer:{

	}
}

export const ReturnTypes: Record<string,any> = {
	Message:{
		"...on Question": "Question",
		"...on Answer": "Answer",
		content:"String",
		score:"Int",
		_id:"String",
		createdAt:"String",
		updatedAt:"String",
		user:"User",
		answers:"Answer"
	},
	StringId:{
		"...on Message": "Message",
		"...on Question": "Question",
		"...on Answer": "Answer",
		"...on User": "User",
		_id:"String"
	},
	Question:{
		content:"String",
		score:"Int",
		_id:"String",
		answers:"Answer",
		title:"String",
		createdAt:"String",
		updatedAt:"String",
		user:"User"
	},
	Answer:{
		content:"String",
		score:"Int",
		_id:"String",
		to:"ToAnswer",
		createdAt:"String",
		updatedAt:"String",
		user:"User",
		answers:"Answer"
	},
	Query:{
		search:"QuestionsResponse",
		top:"QuestionsResponse",
		question:"Question",
		me:"User"
	},
	QuestionsResponse:{
		question:"Question",
		bestAnswer:"Answer"
	},
	Mutation:{
		user:"UserMutation",
		public:"PublicMutation"
	},
	UserMutation:{
		postQuestion:"String",
		postAnswer:"String",
		vote:"Int"
	},
	PublicMutation:{
		register:"AuthPayload",
		login:"AuthPayload"
	},
	ToAnswer:{
		"...on Question":"Question",
		"...on Answer":"Answer"
	},
	User:{
		username:"String",
		_id:"String",
		createdAt:"String",
		updatedAt:"String"
	},
	AuthPayload:{
		token:"String",
		user:"User"
	},
	Dated:{
		"...on Message": "Message",
		"...on Question": "Question",
		"...on Answer": "Answer",
		"...on User": "User",
		createdAt:"String",
		updatedAt:"String"
	},
	Owned:{
		"...on Message": "Message",
		"...on Question": "Question",
		"...on Answer": "Answer",
		user:"User"
	}
}

export const Ops = {
query: "Query" as const,
	mutation: "Mutation" as const
}