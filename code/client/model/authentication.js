const initial_state =
{
	// loaded: false
}

const handlers =
{
	'authenticating user': (result, state) =>
	{
		const new_state = 
		{
			...state,
			authenticating       : true,
			authentication_error : undefined
		}

		return new_state
	},

	'user authenticated': (result, state) =>
	{
		const new_state = 
		{
			...state,
			authenticating : false,
			user           : result.id ? result : undefined
		}

		return new_state
	},

	'user authentication failed': (error, state) =>
	{
		const new_state = 
		{
			...state,
			authenticating       : false,
			authentication_error : error
		}

		return new_state
	},

	'registering user': (result, state) =>
	{
		const new_state = 
		{
			...state,
			registering        : true,
			registration_error : undefined
		}

		return new_state
	},

	'user registered': (result, state) =>
	{
		const new_state = 
		{
			...state,
			registering : false
		}

		return new_state
	},

	'user registration failed': (error, state) =>
	{
		const new_state = 
		{
			...state,
			registering        : false,
			registration_error : error
		}

		return new_state
	},

	'reset user registration error': (result, state) =>
	{
		const new_state = 
		{
			...state,
			registration_error : undefined
		}

		return new_state
	},

	'signing user in': (result, state) =>
	{
		const new_state = 
		{
			...state,
			signing_in    : true,
			sign_in_error : undefined
		}

		return new_state
	},

	'user signed in': (result, state) =>
	{
		const new_state = 
		{
			...state,
			signing_in : false,
			user       : result
		}

		return new_state
	},

	'user sign in failed': (error, state) =>
	{
		const new_state = 
		{
			...state,
			signing_in    : false,
			sign_in_error : error
		}

		return new_state
	},

	'reset user sign in error': (result, state) =>
	{
		const new_state = 
		{
			...state,
			sign_in_error : undefined
		}

		return new_state
	},

	'signing user out': (result, state) =>
	{
		const new_state = 
		{
			...state,
			signing_out    : true,
			sign_out_error : undefined
		}

		return new_state
	},

	'user signed out': (result, state) =>
	{
		const new_state = 
		{
			...state,
			signing_out : false,
			user        : undefined
		}

		return new_state
	},

	'user sign out failed': (error, state) =>
	{
		const new_state = 
		{
			...state,
			signing_out    : false,
			sign_out_error : error
		}

		return new_state
	}
}

// for this module to work should be added to model/index.js

// applies a handler based on the action type
// (is copy & paste'd for all action response handlers)
export default function(state = initial_state, action_data = {})
{
	return (handlers[action_data.type] || ((result, state) => state))(action_data.result || action_data.error || action_data, state)
}