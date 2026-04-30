import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

import { name as packageName, version as packageVersion } from '../package.json';

export class DoomscrollrApi implements ICredentialType {
	name = 'doomscrollrApi';

	displayName = 'DOOMSCROLLR API';

	icon: Icon = { light: 'file:../icons/doomscrollr.svg', dark: 'file:../icons/doomscrollr.dark.svg' };

	documentationUrl = 'https://doomscrollr.com/docs/n8n.md';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Create an API key in DOOMSCROLLR Dashboard → Settings → API keys',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://doomscrollr.com',
			required: true,
			description: 'Use the default unless you are connecting to a custom DOOMSCROLLR API host',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials?.apiKey}}',
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'X-Doomscrollr-Client': packageName,
				'X-Doomscrollr-Client-Version': packageVersion,
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials?.baseUrl.replace(/\\/$/, "")}}/api/v1',
			url: '/profile',
			method: 'GET',
		},
	};
}
