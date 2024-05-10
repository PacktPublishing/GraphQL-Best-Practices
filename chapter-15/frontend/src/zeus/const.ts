/* eslint-disable */

export const AllTypesProps: Record<string,any> = {
	PublicMutation:{
		register:{

		},
		login:{

		}
	},
	SalonOps:{
		createService:{
			service:"CreateService"
		},
		serviceOps:{

		},
		update:{
			salon:"UpdateSalon"
		},
		createVisit:{
			visit:"CreateVisitFromAdmin"
		},
		visitOps:{

		},
		sendMessage:{
			message:"MessageInput"
		}
	},
	CreateSalon:{

	},
	UpdateSalon:{

	},
	SalonClient:{
		visits:{
			filterDates:"DateFilter"
		}
	},
	SalonQuery:{
		visits:{
			filterDates:"DateFilter"
		},
		analytics:{
			filterDates:"DateFilter"
		}
	},
	DateFilter:{

	},
	CreateService:{

	},
	UpdateService:{

	},
	ServiceOps:{
		update:{
			service:"UpdateService"
		}
	},
	VisitStatus: "enum" as const,
	CreateVisitFromClient:{

	},
	CreateVisitFromAdmin:{

	},
	UpdateVisitFromAdmin:{

	},
	VisitOps:{
		update:{
			visit:"UpdateVisitFromAdmin"
		}
	},
	UserOps:{
		registerAsSalon:{
			salon:"CreateSalon"
		},
		registerAsClient:{
			client:"CreateClient"
		}
	},
	CreateClient:{

	},
	UpdateClient:{

	},
	ClientOps:{
		update:{
			client:"UpdateClient"
		},
		createVisit:{
			visit:"CreateVisitFromClient"
		},
		sendMessage:{
			message:"MessageInput"
		},
		registerToSalon:{

		}
	},
	RegistrationError: "enum" as const,
	VisitError: "enum" as const,
	MessageInput:{

	}
}

export const ReturnTypes: Record<string,any> = {
	Dated:{
		"...on User": "User",
		"...on SalonProfile": "SalonProfile",
		"...on SalonClient": "SalonClient",
		"...on Visit": "Visit",
		"...on Service": "Service",
		"...on Message": "Message",
		"...on MessageThread": "MessageThread",
		"...on Client": "Client",
		createdAt:"String",
		updatedAt:"String"
	},
	Owned:{
		"...on SalonProfile": "SalonProfile",
		user:"User"
	},
	StringId:{
		"...on User": "User",
		"...on SalonProfile": "SalonProfile",
		"...on SalonClient": "SalonClient",
		"...on Visit": "Visit",
		"...on Service": "Service",
		"...on Message": "Message",
		"...on MessageThread": "MessageThread",
		"...on Client": "Client",
		_id:"String"
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
	PublicMutation:{
		register:"AuthPayload",
		login:"AuthPayload"
	},
	SalonProfile:{
		name:"String",
		slug:"String",
		_id:"String",
		user:"User",
		createdAt:"String",
		updatedAt:"String",
		services:"Service"
	},
	SalonOps:{
		createService:"String",
		serviceOps:"ServiceOps",
		update:"RegisterResponse",
		delete:"Boolean",
		createVisit:"String",
		visitOps:"VisitOps",
		sendMessage:"Boolean"
	},
	SalonClient:{
		salon:"SalonProfile",
		visits:"Visit",
		_id:"String",
		createdAt:"String",
		updatedAt:"String",
		client:"Client",
		messageThread:"MessageThread"
	},
	Visit:{
		_id:"String",
		createdAt:"String",
		updatedAt:"String",
		service:"Service",
		status:"VisitStatus",
		whenDateTime:"String",
		client:"SalonClient"
	},
	SalonQuery:{
		me:"SalonProfile",
		clients:"SalonClient",
		visits:"Visit",
		services:"Service",
		analytics:"SalonAnalytics"
	},
	Service:{
		salon:"SalonProfile",
		approximateDurationInMinutes:"String",
		name:"String",
		description:"String",
		price:"Int",
		createdAt:"String",
		updatedAt:"String",
		_id:"String"
	},
	Query:{
		user:"UserQuery"
	},
	Mutation:{
		salon:"SalonOps",
		public:"PublicMutation",
		user:"UserOps",
		client:"ClientOps"
	},
	ServiceOps:{
		delete:"Boolean",
		update:"Boolean"
	},
	VisitOps:{
		update:"VisitResponse",
		delete:"Boolean"
	},
	SalonAnalytics:{
		visitsPerDay:"AnalyticsAmountPerDate",
		cashPerDay:"AnalyticsAmountPerDate"
	},
	AnalyticsAmountPerDate:{
		date:"String",
		amount:"Int"
	},
	ClientQuery:{
		clients:"SalonClient",
		me:"Client"
	},
	UserOps:{
		registerAsSalon:"RegisterResponse",
		registerAsClient:"RegisterResponse"
	},
	ClientOps:{
		update:"RegisterResponse",
		createVisit:"VisitResponse",
		sendMessage:"Boolean",
		registerToSalon:"Boolean"
	},
	RegisterResponse:{
		errors:"RegistrationError"
	},
	VisitResponse:{
		errors:"VisitError"
	},
	Message:{
		createdAt:"String",
		updatedAt:"String",
		_id:"String",
		sender:"MessageSender",
		messageThread:"MessageThread",
		message:"String"
	},
	MessageSender:{
		"...on SalonClient":"SalonClient",
		"...on SalonProfile":"SalonProfile"
	},
	MessageThread:{
		salon:"SalonProfile",
		client:"SalonClient",
		messages:"Message",
		_id:"String",
		createdAt:"String",
		updatedAt:"String"
	},
	Client:{
		firstName:"String",
		lastName:"String",
		email:"String",
		phone:"String",
		user:"User",
		_id:"String",
		createdAt:"String",
		updatedAt:"String"
	},
	UserQuery:{
		me:"User",
		salon:"SalonQuery",
		client:"ClientQuery"
	}
}

export const Ops = {
query: "Query" as const,
	mutation: "Mutation" as const
}