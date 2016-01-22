// This is an example of a simple REST Api implementation.
//
// For debugging you can use "Advanced REST Client" for Google Chrome:
// https://chrome.google.com/webstore/detail/advanced-rest-client/hgmloofddffdnphfgcellkdfbfbjeloo

import bcrypt from 'bcrypt'

Promise.promisifyAll(bcrypt)

const users = new Map()
let id_counter = 0

function find_user_by_id(id)
{
	return users.get(id)
}

function find_user_by_email(email)
{
	for (let [user_id, user] of users)
	{
		if (user.email === email)
		{
			return user
		}
	}
}

function find_user_by_remember_me_token(remember_me_token)
{
	for (let [user_id, user] of users)
	{
		if (exists(user.remember_me))
		{
			for (let token of Object.keys(user.remember_me))
			{
				if (token === remember_me_token)
				{
					return user
				}
			}
		}
	}
}

function update_user(user)
{
	users.set(user.id, user)
}

function find_user_remember_me_token_by_session_id(user, session_id)
{
	if (user.remember_me)
	{
		for (let token of Object.keys(user.remember_me))
		{
			if (user.remember_me[token].session === session_id)
			{
				return token
			}
		}
	}
}

function generate_remember_me_token()
{
	return random_string(32, '#aA!')
}

// http://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript
function random_string(length, chars)
{
	let mask = ''

	if (chars.has('a')) mask += 'abcdefghijklmnopqrstuvwxyz'
	if (chars.has('A')) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	if (chars.has('#')) mask += '0123456789'
	if (chars.has('!')) mask += '~`!@#$%^&*()_+-={}[]:"\'<>?,./|\\'

	let result = ''
	for (let i = length; i > 0; --i)
	{
		result += mask[Math.floor(Math.random() * mask.length)]
	}

	return result
}

function user_signed_in(user, remember_me_token, ip, session, session_id, set_cookie)
{
	// if we came here from `sign_in` method (not from `authenticate` method)
	if (!remember_me_token)
	{
		remember_me_token = generate_remember_me_token()

		// http://stackoverflow.com/questions/3290424/set-a-cookie-to-never-expire
		const expires = new Date(2147483647000)  // January 2038
		set_cookie('remember_me', remember_me_token, { expires })
	}

	user.remember_me = user.remember_me || {}
	user.remember_me[remember_me_token] = { ip, time: new Date(), session: session_id }

	session.user = { id: user.id, name: user.name }

	update_user(user)
}

api.post('/sign_in', async function({ email, password }, { session, session_id, ip, set_cookie })
{
	const user = find_user_by_email(email)

	if (!user)
	{
		throw new Errors.Not_found(`User with email ${email} not found`)
	}

	const matches = await check_password(password, user.password)

	if (!matches)
	{
		throw new Error(`Wrong password`) 
	}

	user_signed_in(user, undefined, ip, session, session_id, set_cookie)

	return session.user
})

api.post('/register', async function({ name, email, password })
{
	if (!exists(name))
	{
		throw new Errors.Input_missing(`"name" not specified`)
	}

	if (!exists(email))
	{
		throw new Errors.Input_missing(`"email" not specified`)
	}

	if (!exists(password))
	{
		throw new Errors.Input_missing(`"password" not specified`)
	}

	if (find_user_by_email(email))
	{
		throw new Error(`User with email ${email} already exists`)
	}

	id_counter++
	const id = String(id_counter)

	password = await hash_password(password)

	users.set(id, { id, name, email, password })

	return { id }
})

api.post('/authenticate', async function({}, { session, session_id, ip, get_cookie, set_cookie, destroy_cookie })
{
	console.log('*** authenticate. session', session, 'id', session_id)

	if (!session.user)
	{
		const remember_me_token = get_cookie('remember_me')
		const user = find_user_by_remember_me_token(remember_me_token)

		if (!user)
		{
			// the cookie won't be actually destroyed 
			// because this code is normally run on server-side
			// where changes to cookies don't take effect
			destroy_cookie('remember_me')
			return
		}

		user_signed_in(user, remember_me_token, ip, session, session_id, set_cookie)
	}

	return { id: session.user.id, name: session.user.name }
})

api.post('/sign_out', function({}, { session, session_id, destroy_session, destroy_cookie })
{
	const user = session.user ? find_user_by_id(session.user.id) : undefined

	if (!user)
	{
		return
	}

	// console.log('*** user before sign out', user)

	const remember_me_token = find_user_remember_me_token_by_session_id(user, session_id)
	
	if (remember_me_token)
	{
		delete user.remember_me[remember_me_token]
		update_user(user)
	}

	// console.log('*** user after sign out', user)

	destroy_cookie('remember_me')

	destroy_session()
})

function check_password(password, hashed_password)
{
	return bcrypt.compareAsync(password, hashed_password)
}

async function hash_password(password)
{
	const salt = await bcrypt.genSaltAsync(10)
	return await bcrypt.hashAsync(password, salt)
}