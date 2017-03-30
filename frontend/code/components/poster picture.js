import React, { PropTypes } from 'react'
import classNames from 'classnames'

import default_poster_picture from '../../assets/images/poster picture.png'

import { Picture } from './upload picture'

const fallback =
{
	sizes:
	[{
		width  : 1400,
		height : 1400,
		file   : default_poster_picture
	}]
}

export default class Poster_picture extends React.Component
{
	static propTypes =
	{
		poster    : PropTypes.object.isRequired,
		style     : PropTypes.object,
		className : PropTypes.string
	}

	render()
	{
		const
		{
			picture,
			poster,
			style,
			className
		}
		= this.props

		return <Picture
			type="poster_picture"
			fallback={ fallback }
			uploaded={ picture ? true : false }
			picture={ picture || poster.picture }
			style={ style }
			className={ classNames('poster-picture', className) }/>
	}
}