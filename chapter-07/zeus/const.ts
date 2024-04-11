/* eslint-disable */

export const AllTypesProps: Record<string,any> = {
	PostInput:{

	},
	UserOps:{
		addFriend:{

		},
		removeFriend:{

		},
		post:{
			post:"PostInput"
		},
		setProfile:{
			userInput:"UserInput"
		}
	},
	UserInput:{

	}
}

export const ReturnTypes: Record<string,any> = {
	Post:{
		id:"ID",
		title:"String",
		content:"String",
		author:"User"
	},
	User:{
		friends:"User",
		id:"ID",
		posts:"Post",
		firstName:"String",
		lastName:"String"
	},
	Query:{
		me:"User"
	},
	UserOps:{
		addFriend:"User",
		removeFriend:"Boolean",
		post:"Post",
		setProfile:"User"
	},
	Mutation:{
		me:"UserOps"
	}
}

export const Ops = {
query: "Query" as const,
	mutation: "Mutation" as const
}