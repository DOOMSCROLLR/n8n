import {
	NodeApiError,
	NodeConnectionTypes,
	NodeOperationError,
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeProperties,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

type HttpMethod = 'GET' | 'POST' | 'PATCH';

type FixedCollection<T> = {
	[key: string]: T[];
};

const statusOptions = [
	{ name: 'Published', value: 'published' },
	{ name: 'Draft', value: 'draft' },
	{ name: 'Scheduled', value: 'scheduled' },
];

const productTypeOptions = [
	{ name: 'Physical', value: 'physical' },
	{ name: 'Digital', value: 'digital' },
	{ name: 'Ticket', value: 'ticket' },
	{ name: 'Subscription', value: 'subscription' },
];

const resourceOptions = [
	{ name: 'Analytics', value: 'analytics' },
	{ name: 'Capture Widget', value: 'capture' },
	{ name: 'Embed Code', value: 'embed' },
	{ name: 'Page', value: 'page' },
	{ name: 'Pinterest', value: 'pinterest' },
	{ name: 'Post', value: 'post' },
	{ name: 'Product', value: 'product' },
	{ name: 'Profile', value: 'profile' },
	{ name: 'RSS', value: 'rss' },
	{ name: 'Subscriber', value: 'subscriber' },
];

const operationOptionsByResource: Record<string, Array<{ name: string; value: string }>> = {
	analytics: [{ name: 'Get Top Liked Posts', value: 'topLikedPosts' }],
	capture: [
		{ name: 'Get Settings', value: 'getSettings' },
		{ name: 'Update Settings', value: 'updateSettings' },
	],
	embed: [{ name: 'Get Code', value: 'getCode' }],
	page: [
		{ name: 'Create', value: 'create' },
		{ name: 'Create Contact Page', value: 'createContactPage' },
		{ name: 'List', value: 'list' },
	],
	pinterest: [
		{ name: 'Connect Board', value: 'connectBoard' },
		{ name: 'Get Status', value: 'getStatus' },
		{ name: 'Search Pins', value: 'searchPins' },
		{ name: 'Search Pins and Create Posts', value: 'searchPinsAndCreatePosts' },
	],
	post: [
		{ name: 'Create Image Post', value: 'createImage' },
		{ name: 'Create Link Post', value: 'createLink' },
		{ name: 'List', value: 'list' },
	],
	product: [
		{ name: 'Create', value: 'create' },
		{ name: 'List', value: 'list' },
	],
	profile: [{ name: 'Get', value: 'get' }],
	rss: [
		{ name: 'Connect Feed', value: 'connectFeed' },
		{ name: 'Get Status', value: 'getStatus' },
	],
	subscriber: [
		{ name: 'Add', value: 'add' },
		{ name: 'List', value: 'list' },
	],
};

const operationProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: operationOptionsByResource.analytics,
		default: 'topLikedPosts',
		displayOptions: {
			show: {
				resource: ['analytics'],
			},
		},
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: operationOptionsByResource.capture,
		default: 'getSettings',
		displayOptions: {
			show: {
				resource: ['capture'],
			},
		},
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: operationOptionsByResource.embed,
		default: 'getCode',
		displayOptions: {
			show: {
				resource: ['embed'],
			},
		},
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: operationOptionsByResource.page,
		default: 'create',
		displayOptions: {
			show: {
				resource: ['page'],
			},
		},
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: operationOptionsByResource.pinterest,
		default: 'connectBoard',
		displayOptions: {
			show: {
				resource: ['pinterest'],
			},
		},
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: operationOptionsByResource.post,
		default: 'createImage',
		displayOptions: {
			show: {
				resource: ['post'],
			},
		},
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: operationOptionsByResource.product,
		default: 'create',
		displayOptions: {
			show: {
				resource: ['product'],
			},
		},
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: operationOptionsByResource.profile,
		default: 'get',
		displayOptions: {
			show: {
				resource: ['profile'],
			},
		},
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: operationOptionsByResource.rss,
		default: 'connectFeed',
		displayOptions: {
			show: {
				resource: ['rss'],
			},
		},
	},
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: operationOptionsByResource.subscriber,
		default: 'add',
		displayOptions: {
			show: {
				resource: ['subscriber'],
			},
		},
	}
];

const paginationFields: INodeProperties[] = [
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 1,
		description: 'Page number to return',
	},
	{
		displayName: 'Items Per Page',
		name: 'perPage',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 50 },
		default: 20,
		description: 'Number of items to return. The API caps this at 50.',
	},
];

const postListFields = withDisplay(
	[
		...paginationFields,
		{
			displayName: 'Search',
			name: 'query',
			type: 'string',
			default: '',
			description: 'Search title, description, or URL',
		},
		{
			displayName: 'Status',
			name: 'status',
			type: 'options',
			options: [{ name: 'Any', value: '' }, ...statusOptions],
			default: '',
		},
		{
			displayName: 'Tag',
			name: 'tag',
			type: 'string',
			default: '',
			description: 'Filter by exact tag name',
		},
	],
	{ resource: ['post'], operation: ['list'] },
);

const postCreateFields = withDisplay(
	[
		{
			displayName: 'URL',
			name: 'url',
			type: 'string',
			default: '',
			required: true,
			description: 'Link URL to publish to DOOMSCROLLR',
		},
		{
			displayName: 'Title',
			name: 'title',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Description',
			name: 'description',
			type: 'string',
			typeOptions: { rows: 4 },
			default: '',
		},
		{
			displayName: 'Tags',
			name: 'tags',
			type: 'string',
			default: '',
			description: 'Comma-separated tags',
		},
		{
			displayName: 'Status',
			name: 'postStatus',
			type: 'options',
			options: statusOptions,
			default: 'draft',
			description: 'Use draft unless the workflow should publish immediately',
		},
		{
			displayName: 'Publish At',
			name: 'publishAt',
			type: 'dateTime',
			default: '',
			description: 'Future publish time. When set, DOOMSCROLLR schedules the post.',
		},
	],
	{ resource: ['post'], operation: ['createLink'] },
);

const imagePostCreateFields = withDisplay(
	[
		{
			displayName: 'Image URL or Data',
			name: 'image',
			type: 'string',
			default: '',
			required: true,
			description: 'Image URL or image string accepted by the DOOMSCROLLR API',
		},
		{
			displayName: 'Title',
			name: 'title',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Description',
			name: 'description',
			type: 'string',
			typeOptions: { rows: 4 },
			default: '',
		},
		{
			displayName: 'Tags',
			name: 'tags',
			type: 'string',
			default: '',
			description: 'Comma-separated tags',
		},
		{
			displayName: 'Status',
			name: 'postStatus',
			type: 'options',
			options: statusOptions,
			default: 'draft',
			description: 'Use draft unless the workflow should publish immediately',
		},
		{
			displayName: 'Publish At',
			name: 'publishAt',
			type: 'dateTime',
			default: '',
		},
	],
	{ resource: ['post'], operation: ['createImage'] },
);

const productFields = [
	...withDisplay(
		[
			...paginationFields,
			{
				displayName: 'Search',
				name: 'query',
				type: 'string',
				default: '',
				description: 'Search title, description, or SKU',
			},
			{
				displayName: 'Type',
				name: 'productTypeFilter',
				type: 'options',
				options: [{ name: 'Any', value: '' }, ...productTypeOptions],
				default: '',
			},
			{
				displayName: 'Minimum Price',
				name: 'minPrice',
				type: 'number',
				typeOptions: { minValue: 0 },
				default: 0,
			},
			{
				displayName: 'Maximum Price',
				name: 'maxPrice',
				type: 'number',
				typeOptions: { minValue: 0 },
				default: 0,
			},
		],
		{ resource: ['product'], operation: ['list'] },
	),
	...withDisplay(
		[
			{
				displayName: 'Title',
				name: 'productTitle',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'Description',
				name: 'productDescription',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
			},
			{
				displayName: 'Price',
				name: 'price',
				type: 'number',
				typeOptions: { minValue: 0 },
				default: 0,
				required: true,
				description: 'Price in dollars, for example 29.99',
			},
			{
				displayName: 'Type',
				name: 'productType',
				type: 'options',
				options: productTypeOptions,
				default: 'digital',
				required: true,
			},
			{
				displayName: 'Cover Photo URL',
				name: 'coverPhotoUrl',
				type: 'string',
				default: '',
			},
			{
				displayName: 'External URL',
				name: 'externalUrl',
				type: 'string',
				default: '',
				description: 'Optional external product or digital download URL',
			},
			{
				displayName: 'Inventory Count',
				name: 'inventoryCount',
				type: 'number',
				typeOptions: { minValue: 0 },
				default: 0,
			},
			{
				displayName: 'Shipping Required',
				name: 'shippingRequired',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Shipping Cost',
				name: 'shippingCost',
				type: 'number',
				typeOptions: { minValue: 0 },
				default: 0,
			},
		],
		{ resource: ['product'], operation: ['create'] },
	),
];

const subscriberFields = [
	...withDisplay(
		[
			...paginationFields,
			{
				displayName: 'Search',
				name: 'query',
				type: 'string',
				default: '',
				description: 'Search email, name, username, or phone',
			},
			{
				displayName: 'Tag',
				name: 'tag',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Bounced Only',
				name: 'bouncedOnly',
				type: 'boolean',
				default: false,
			},
		],
		{ resource: ['subscriber'], operation: ['list'] },
	),
	...withDisplay(
		[
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'Subscriber email address. Required unless Email MD5 is provided.',
			},
			{
				displayName: 'Email MD5',
				name: 'emailMd5',
				type: 'string',
				default: '',
				description: 'MD5 hash of lowercase trimmed email when raw email is unavailable',
			},
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Source',
				name: 'source',
				type: 'string',
				default: 'n8n',
			},
			{
				displayName: 'Tags',
				name: 'subscriberTags',
				type: 'string',
				default: '',
				description: 'Comma-separated tags',
			},
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: '',
			},
		],
		{ resource: ['subscriber'], operation: ['add'] },
	),
];

const pageFields = [
	...withDisplay(
		[
			{
				displayName: 'Title',
				name: 'pageTitle',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'Content',
				name: 'pageContent',
				type: 'string',
				typeOptions: { rows: 8 },
				default: '',
				required: true,
				description: 'Page body as plain text or simple HTML',
			},
			{
				displayName: 'Add To Navigation',
				name: 'addToNavigation',
				type: 'boolean',
				default: true,
			},
			{
				displayName: 'Navigation Label',
				name: 'navigationLabel',
				type: 'string',
				default: '',
			},
		],
		{ resource: ['page'], operation: ['create'] },
	),
	...withDisplay(
		[
			{
				displayName: 'Title',
				name: 'pageTitle',
				type: 'string',
				default: 'Contact',
			},
			{
				displayName: 'Intro',
				name: 'intro',
				type: 'string',
				typeOptions: { rows: 3 },
				default: 'Find me here.',
			},
			{
				displayName: 'Links',
				name: 'linkItems',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				default: {},
				required: true,
				options: [
					{
						displayName: 'Link',
						name: 'links',
						values: [
							{
								displayName: 'Label',
								name: 'label',
								type: 'string',
								default: '',
								required: true,
							},
							{
								displayName: 'URL',
								name: 'url',
								type: 'string',
								default: '',
								required: true,
							},
						],
					},
				],
			},
			{
				displayName: 'Add To Navigation',
				name: 'addToNavigation',
				type: 'boolean',
				default: true,
			},
			{
				displayName: 'Navigation Label',
				name: 'navigationLabel',
				type: 'string',
				default: 'Contact',
			},
		],
		{ resource: ['page'], operation: ['createContactPage'] },
	),
];

const pinterestFields = [
	...withDisplay(
		[
			{
				displayName: 'Board URL',
				name: 'boardUrl',
				type: 'string',
				default: '',
				required: true,
				description: 'Public Pinterest board URL',
			},
		],
		{ resource: ['pinterest'], operation: ['connectBoard'] },
	),
	...withDisplay(
		[
			{
				displayName: 'Search Query',
				name: 'pinterestQuery',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				description: 'Max number of results to return',
				typeOptions: { minValue: 1, maxValue: 25 },
				default: 50,
			},
		],
		{ resource: ['pinterest'], operation: ['searchPins'] },
	),
	...withDisplay(
		[
			{
				displayName: 'Search Query',
				name: 'pinterestQuery',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 10 },
				default: 50,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Status',
				name: 'postStatus',
				type: 'options',
				options: statusOptions,
				default: 'draft',
			},
			{
				displayName: 'Publish At',
				name: 'publishAt',
				type: 'dateTime',
				default: '',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Comma-separated tags for created posts',
			},
		],
		{ resource: ['pinterest'], operation: ['searchPinsAndCreatePosts'] },
	),
];

const rssFields = withDisplay(
	[
		{
			displayName: 'Feed URL',
			name: 'feedUrl',
			type: 'string',
			default: '',
			required: true,
			description: 'RSS or Atom feed URL',
		},
	],
	{ resource: ['rss'], operation: ['connectFeed'] },
);

const analyticsFields = withDisplay(
	[
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			description: 'Max number of results to return',
			typeOptions: { minValue: 1, maxValue: 50 },
			default: 50,
		},
		{
			displayName: 'Lookback Days',
			name: 'days',
			type: 'number',
			typeOptions: { minValue: 1, maxValue: 3650 },
			default: 30,
		},
	],
	{ resource: ['analytics'], operation: ['topLikedPosts'] },
);

const captureFields = withDisplay(
	[
		{
			displayName: 'Enabled',
			name: 'enabled',
			type: 'boolean',
			default: true,
			description: 'Whether to enable the subscriber capture popup',
		},
		{
			displayName: 'Popup Number Posts',
			name: 'popupNumberPosts',
			type: 'number',
			typeOptions: { minValue: 0 },
			default: 0,
			description: 'Number of posts before showing the popup',
		},
		{
			displayName: 'Popup Time Delay',
			name: 'popupTimeDelay',
			type: 'number',
			typeOptions: { minValue: 0 },
			default: 0,
			description: 'Delay in seconds before showing the popup',
		},
	],
	{ resource: ['capture'], operation: ['updateSettings'] },
);

function withDisplay(
	properties: INodeProperties[],
	show: NonNullable<INodeProperties['displayOptions']>['show'],
): INodeProperties[] {
	return properties.map((property) => ({
		...property,
		displayOptions: { show },
	}));
}

function normalizeBaseUrl(baseUrl: string): string {
	const trimmed = baseUrl.trim().replace(/\/+$/, '');
	if (trimmed.endsWith('/api/v1')) {
		return trimmed;
	}
	return `${trimmed}/api/v1`;
}

function addOptional(body: IDataObject, key: string, value: unknown): void {
	if (value === undefined || value === null || value === '') {
		return;
	}
	body[key] = value as IDataObject[string];
}

function addPositiveOptional(body: IDataObject, key: string, value: number): void {
	if (value > 0) {
		body[key] = value;
	}
}

function queryString(params: IDataObject): string {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null && value !== '') {
			search.set(key, String(value));
		}
	}
	const serialized = search.toString();
	return serialized ? `?${serialized}` : '';
}

async function apiRequest(
	this: IExecuteFunctions,
	method: HttpMethod,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
): Promise<IDataObject | IDataObject[]> {
	const credentials = await this.getCredentials('doomscrollrApi');
	const baseUrl = normalizeBaseUrl(String(credentials.baseUrl));
	const hasBody = method !== 'GET' && Object.keys(body).length > 0;
	const options = {
		method,
		url: `${baseUrl}${endpoint}${queryString(query)}`,
		json: true,
		body: hasBody ? body : undefined,
	};

	try {
		return (await this.helpers.httpRequestWithAuthentication.call(
			this,
			'doomscrollrApi',
			options,
		)) as IDataObject | IDataObject[];
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: 'DOOMSCROLLR API request failed',
			description:
				'Check the API key, base URL, request fields, and DOOMSCROLLR account limits. If this is a 429, the monthly API request limit has been reached until the reset time returned by the API.',
		});
	}
}

type JsonObject = ConstructorParameters<typeof NodeApiError>[1];

export class Doomscrollr implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DOOMSCROLLR',
		name: 'doomscrollr',
		icon: { light: 'file:../../icons/doomscrollr.svg', dark: 'file:../../icons/doomscrollr.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Automate DOOMSCROLLR owned-audience websites',
		defaults: {
			name: 'DOOMSCROLLR',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'doomscrollrApi',
				required: true,
			},
		],
		requestDefaults: {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'X-Doomscrollr-Client': '@doomscrollr/n8n-nodes-doomscrollr',
				'X-Doomscrollr-Client-Version': '0.1.1',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: resourceOptions,
				default: 'post',
			},
			...operationProperties,
			...postListFields,
			...postCreateFields,
			...imagePostCreateFields,
			...productFields,
			...subscriberFields,
			...pageFields,
			...pinterestFields,
			...rssFields,
			...analyticsFields,
			...captureFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex) as string;
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				const response = await executeOperation.call(this, resource, operation, itemIndex);

				if (Array.isArray(response)) {
					for (const item of response) {
						returnData.push({ json: item, pairedItem: { item: itemIndex } });
					}
				} else {
					returnData.push({ json: response, pairedItem: { item: itemIndex } });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: itemIndex },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}

}

async function executeOperation(
		this: IExecuteFunctions,
		resource: string,
		operation: string,
		itemIndex: number,
	): Promise<IDataObject | IDataObject[]> {
		switch (`${resource}:${operation}`) {
			case 'profile:get':
				return await apiRequest.call(this, 'GET', '/profile');

			case 'post:list':
				return await apiRequest.call(this, 'GET', '/posts', {}, {
					page: this.getNodeParameter('page', itemIndex) as number,
					per_page: this.getNodeParameter('perPage', itemIndex) as number,
					q: this.getNodeParameter('query', itemIndex) as string,
					status: this.getNodeParameter('status', itemIndex) as string,
					tag: this.getNodeParameter('tag', itemIndex) as string,
				});

			case 'post:createLink':
				return await apiRequest.call(this, 'POST', '/posts', postBody.call(this, itemIndex, false));

			case 'post:createImage':
				return await apiRequest.call(this, 'POST', '/posts/image', postBody.call(this, itemIndex, true));

			case 'product:list':
				return await apiRequest.call(this, 'GET', '/products', {}, {
					page: this.getNodeParameter('page', itemIndex) as number,
					per_page: this.getNodeParameter('perPage', itemIndex) as number,
					q: this.getNodeParameter('query', itemIndex) as string,
					type: this.getNodeParameter('productTypeFilter', itemIndex) as string,
					min_price: this.getNodeParameter('minPrice', itemIndex) as number,
					max_price: this.getNodeParameter('maxPrice', itemIndex) as number,
				});

			case 'product:create':
				return await apiRequest.call(this, 'POST', '/products', productBody.call(this, itemIndex));

			case 'subscriber:list':
				return await apiRequest.call(this, 'GET', '/audience', {}, {
					page: this.getNodeParameter('page', itemIndex) as number,
					per_page: this.getNodeParameter('perPage', itemIndex) as number,
					q: this.getNodeParameter('query', itemIndex) as string,
					tag: this.getNodeParameter('tag', itemIndex) as string,
					bounced: this.getNodeParameter('bouncedOnly', itemIndex) as boolean,
				});

			case 'subscriber:add':
				return await apiRequest.call(this, 'POST', '/audience', subscriberBody.call(this, itemIndex));

			case 'page:list':
				return await apiRequest.call(this, 'GET', '/pages');

			case 'page:create':
				return await apiRequest.call(this, 'POST', '/pages', pageBody.call(this, itemIndex));

			case 'page:createContactPage':
				return await apiRequest.call(this, 'POST', '/pages/contact', contactPageBody.call(this, itemIndex));

			case 'pinterest:connectBoard':
				return await apiRequest.call(this, 'POST', '/integrations/pinterest/connect', {
					board_url: this.getNodeParameter('boardUrl', itemIndex) as string,
				});

			case 'pinterest:getStatus':
				return await apiRequest.call(this, 'GET', '/integrations/pinterest/status');

			case 'pinterest:searchPins':
				return await apiRequest.call(this, 'GET', '/integrations/pinterest/search', {}, {
					query: this.getNodeParameter('pinterestQuery', itemIndex) as string,
					limit: this.getNodeParameter('limit', itemIndex) as number,
				});

			case 'pinterest:searchPinsAndCreatePosts':
				return await apiRequest.call(this, 'POST', '/integrations/pinterest/search-post', pinterestPostBody.call(this, itemIndex));

			case 'rss:connectFeed':
				return await apiRequest.call(this, 'POST', '/integrations/rss', {
					feed_url: this.getNodeParameter('feedUrl', itemIndex) as string,
				});

			case 'rss:getStatus':
				return await apiRequest.call(this, 'GET', '/integrations/rss/status');

			case 'analytics:topLikedPosts':
				return await apiRequest.call(this, 'GET', '/analytics/top-liked-posts', {}, {
					limit: this.getNodeParameter('limit', itemIndex) as number,
					days: this.getNodeParameter('days', itemIndex) as number,
				});

			case 'embed:getCode':
				return await apiRequest.call(this, 'GET', '/embed');

			case 'capture:getSettings':
				return await apiRequest.call(this, 'GET', '/capture');

			case 'capture:updateSettings':
				return await apiRequest.call(this, 'PATCH', '/capture', {
					enabled: this.getNodeParameter('enabled', itemIndex) as boolean,
					popup_number_posts: this.getNodeParameter('popupNumberPosts', itemIndex) as number,
					popup_time_delay: this.getNodeParameter('popupTimeDelay', itemIndex) as number,
				});

			default:
				throw new NodeOperationError(this.getNode(), `Unsupported DOOMSCROLLR operation: ${resource}:${operation}`);
		}
	}

function postBody(this: IExecuteFunctions, itemIndex: number, isImage: boolean): IDataObject {
		const body: IDataObject = {
			status: this.getNodeParameter('postStatus', itemIndex) as string,
		};
		if (isImage) {
			body.image = this.getNodeParameter('image', itemIndex) as string;
		} else {
			body.url = this.getNodeParameter('url', itemIndex) as string;
		}
		addOptional(body, 'title', this.getNodeParameter('title', itemIndex) as string);
		addOptional(body, 'description', this.getNodeParameter('description', itemIndex) as string);
		addOptional(body, 'tags', this.getNodeParameter('tags', itemIndex) as string);
		addOptional(body, 'publish_at', this.getNodeParameter('publishAt', itemIndex) as string);
		return body;
	}

function productBody(this: IExecuteFunctions, itemIndex: number): IDataObject {
		const body: IDataObject = {
			title: this.getNodeParameter('productTitle', itemIndex) as string,
			price: this.getNodeParameter('price', itemIndex) as number,
			type: this.getNodeParameter('productType', itemIndex) as string,
		};
		addOptional(body, 'description', this.getNodeParameter('productDescription', itemIndex) as string);
		addOptional(body, 'cover_photo_url', this.getNodeParameter('coverPhotoUrl', itemIndex) as string);
		addOptional(body, 'url', this.getNodeParameter('externalUrl', itemIndex) as string);
		addPositiveOptional(body, 'inventory_count', this.getNodeParameter('inventoryCount', itemIndex) as number);
		addOptional(body, 'shipping_required', this.getNodeParameter('shippingRequired', itemIndex) as boolean);
		addPositiveOptional(body, 'shipping_cost', this.getNodeParameter('shippingCost', itemIndex) as number);
		return body;
	}

function subscriberBody(this: IExecuteFunctions, itemIndex: number): IDataObject {
		const body: IDataObject = {};
		addOptional(body, 'email', this.getNodeParameter('email', itemIndex) as string);
		addOptional(body, 'email_md5', this.getNodeParameter('emailMd5', itemIndex) as string);
		if (!body.email && !body.email_md5) {
			throw new NodeOperationError(this.getNode(), 'Provide either Email or Email MD5 when adding a subscriber.');
		}
		addOptional(body, 'first_name', this.getNodeParameter('firstName', itemIndex) as string);
		addOptional(body, 'last_name', this.getNodeParameter('lastName', itemIndex) as string);
		addOptional(body, 'phone', this.getNodeParameter('phone', itemIndex) as string);
		addOptional(body, 'source', this.getNodeParameter('source', itemIndex) as string);
		addOptional(body, 'tags', this.getNodeParameter('subscriberTags', itemIndex) as string);
		addOptional(body, 'city', this.getNodeParameter('city', itemIndex) as string);
		addOptional(body, 'state', this.getNodeParameter('state', itemIndex) as string);
		addOptional(body, 'country', this.getNodeParameter('country', itemIndex) as string);
		return body;
	}

function pageBody(this: IExecuteFunctions, itemIndex: number): IDataObject {
		const body: IDataObject = {
			title: this.getNodeParameter('pageTitle', itemIndex) as string,
			content: this.getNodeParameter('pageContent', itemIndex) as string,
			add_to_navigation: this.getNodeParameter('addToNavigation', itemIndex) as boolean,
		};
		addOptional(body, 'navigation_label', this.getNodeParameter('navigationLabel', itemIndex) as string);
		return body;
	}

function contactPageBody(this: IExecuteFunctions, itemIndex: number): IDataObject {
		const linkCollection = this.getNodeParameter('linkItems', itemIndex, {}) as FixedCollection<IDataObject>;
		const links = linkCollection.links ?? [];
		if (links.length === 0) {
			throw new NodeOperationError(this.getNode(), 'Add at least one link for the contact page.');
		}
		const body: IDataObject = {
			title: this.getNodeParameter('pageTitle', itemIndex) as string,
			intro: this.getNodeParameter('intro', itemIndex) as string,
			links,
			add_to_navigation: this.getNodeParameter('addToNavigation', itemIndex) as boolean,
		};
		addOptional(body, 'navigation_label', this.getNodeParameter('navigationLabel', itemIndex) as string);
		return body;
	}

function pinterestPostBody(this: IExecuteFunctions, itemIndex: number): IDataObject {
		const body: IDataObject = {
			query: this.getNodeParameter('pinterestQuery', itemIndex) as string,
			limit: this.getNodeParameter('limit', itemIndex) as number,
			status: this.getNodeParameter('postStatus', itemIndex) as string,
		};
		addOptional(body, 'publish_at', this.getNodeParameter('publishAt', itemIndex) as string);
		addOptional(body, 'tags', this.getNodeParameter('tags', itemIndex) as string);
		return body;
	}
