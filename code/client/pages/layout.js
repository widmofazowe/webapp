import React, { Component, PropTypes } from 'react'

import { bindActionCreators as bind_action_creators } from 'redux'

// testing `flat` styler
import styler              from 'react-styling/flat'
import { preload }         from 'react-isomorphic-render/redux'
import { connect }         from 'react-redux'
import { Link, IndexLink } from 'react-router'
import { defineMessages }  from 'react-intl'
import { head }            from 'react-isomorphic-render'

// import autoprefixer from 'autoprefixer'

import international   from '../international/internationalize'

import Menu            from '../components/menu'
import Menu_button     from '../components/menu button'
import Locale_switcher from '../components/locale switcher'
import Authentication  from '../components/authentication'
import Preloading      from '../components/preloading'

// import { authenticate } from '../actions/authentication'

// when adjusting this transition time also adjust it in styles/xs-m.scss
const menu_transition_duration = 210 // milliseconds

// @preload
// ({
// 	blocking: (dispatch, get_model) => dispatch(authenticate())
// })
@international()
export default class Layout extends Component
{
	state = 
	{
		show_menu  : false,
		menu_width : 0,

		page_moved_aside : false
	};

	static propTypes =
	{
		children : PropTypes.node.isRequired
	};

	render()
	{
		const { translate } = this.props

		const title       = translate(messages.title)
		const description = translate(messages.description)

		// <head/> <meta/> tags
		const meta =
		{
			// <meta charset="utf-8" />
			charSet: 'utf-8',

			name:
			{
				// all <meta name="..." content="..."/> tags go here

				// i don't fully understand what it does
				// https://css-tricks.com/probably-use-initial-scale1/
				//
				// user-scalable=no removes touch event delay ~300ms
				//
				viewport: 'width=device-width, initial-scale=1.0, user-scalable=no'
			},

			property:
			{
				// all <meta property="..." content="..."/> tags go here

				'og:site_name': title,
				'og:locale': 'ru_RU',
				'og:title': title,
				'og:description': description,
			}
		}

		const markup = 
		(
			<div className={ 'layout' + ' ' + (this.state.page_moved_aside ? 'layout-with-page-aside' : '') }>
				{/* <head/> */}
				{head(title, description, meta)}

				{/* navigation for small screens (will slide out) */}
				{/*<nav>*/}
					{/* main menu */}
					<Menu show={this.state.show_menu} show_while={this.state.page_moved_aside} toggle={::this.toggle_menu} update_width={::this.update_menu_width} items={menu_entries(translate)}/>
				{/*</nav>*/}

				{/* webpage */}
				<div className="page" style={ this.state.show_menu ? merge(style.page, { transform: `translate3d(${this.state.menu_width}px, 0px, 0px)` }) : style.page }>
					{/* "page is preloading" spinner */}
					<Preloading/>

					{/* header */}
					<header>
						{/* menu button for small screens */}
						<div className="menu-button-container">
							<Menu_button toggle={::this.toggle_menu}/>
						</div>

						{/* home page link */}
						<div className="logo" style={{ textAlign: 'center' }}>
							<IndexLink to="/" style={style.home} activeStyle={style.home_active}>
								{translate(messages.title)}
							</IndexLink>
						</div>

						{/* navigation for wide screens */}
						{/*<nav>*/}
							{/* main menu */}
							<Menu items={menu_entries(translate)}/>
						{/*</nav>*/}

						{/* User accout section */}
						<Authentication/>
					</header>

					{/* page content */}
					{this.props.children}

					<footer>
						<div><a href="https://github.com/halt-hammerzeit">halt-hammerzeit@github.com</a></div>

						{/* language chooser */}
						<div className="language-wrapper">
							<Locale_switcher upward={true} style={style.locale_switcher}/>
						</div>
					</footer>
				</div>
			</div>
		)

		return markup
	}

	toggle_menu()
	{
		if (!this.state.show_menu)
		{
			return this.setState({ show_menu: !this.state.show_menu, page_moved_aside: !this.state.page_moved_aside })
		}

		this.setState({ show_menu: !this.state.show_menu }, () =>
		{
			setTimeout(() =>
			{
				this.setState({ page_moved_aside: this.state.show_menu })
			}, 
			menu_transition_duration)
		})
	}

	update_menu_width(width)
	{
		this.setState({ menu_width: width })
	}
}

export const messages = defineMessages
({
	title:
	{
		id             : 'application.title',
		description    : 'Web application title',
		defaultMessage : 'WebApp'
	},
	description:
	{
		id             : 'application.description',
		description    : 'Web application description',
		defaultMessage : 'A generic web application boilerplate'
	},
	menu_example:
	{
		id             : 'menu.example',
		description    : 'API usage examples',
		defaultMessage : 'Example'
	},
	menu_components_showcase:
	{
		id             : 'menu.components_showcase',
		description    : 'The section shows various React components in action',
		defaultMessage : 'Showcase'
	},
	menu_log:
	{
		id             : 'menu.log',
		description    : 'The section shows log messages from all the parts of the application',
		defaultMessage : 'Log'
	}
})

const style = styler
`
	page
		position : relative
		z-index  : 0
		transition-duration : ${menu_transition_duration}ms

	home
		text-decoration : none

		active
			cursor : default
			color  : inherit
`

export function menu_entries(translate)
{
	return [{
		name: translate(messages.menu_example),
		link: '/example/simple'
	}, {
		name: translate(messages.menu_components_showcase),
		link: '/showcase/form'
	}, {
		name: translate(messages.menu_log),
		link: '/logs'
	}]
}