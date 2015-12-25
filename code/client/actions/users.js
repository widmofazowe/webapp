export function get()
{
	const action =
	{
		promise: http =>
		{
			return http.get('/api/example/users').then(ids =>
			{
				return Promise.map(ids, id => http.get(`/api/example/users/${id}`))
			})
		},
		events: ['retrieving users', 'users retrieved', 'users retrieval failed']
	}

	return action
}

export function add(info)
{
	// maybe add validation here

	const action =
	{
		promise: http => http.post(`/api/example/users`, info),
		events: ['adding user', 'user added', 'adding user failed']
	}

	return action
}

export function remove(id)
{
	const action =
	{
		promise: http => http.delete(`/api/example/users/${id}`),
		events: ['deleting user', 'user deleted', 'deleting user failed']
	}

	return action
}

export function rename()
{
	const action =
	{
		promise: http => http.patch(`/api/example/users/${id}`),
		events: ['renaming user', 'user renamed', 'renaming user failed']
	}

	return action
}

export function dismiss_adding_error()
{
	return { type: 'adding error dismissed' }
}

export function upload_picture(user_id, data)
{
	const action =
	{
		promise: http => 
		{
			return http.post(`/upload_image`, data).then(result =>
			{
				return http.post(`/api/example/users/${user_id}/picture`, { file_name: result.file_name })
				.then(() => ({ user_id, picture: result.file_name }))
			})
		},
		events: ['uploading user picture', 'user picture uploaded', 'uploading user picture failed']
	}

	return action
}

export function dismiss_uploading_picture_error()
{
	return { type: 'uploading user picture error dismissed' }
}