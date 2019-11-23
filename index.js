const blocks = '(if|else if|await|then|catch|each)';

Prism.languages.svelte = Prism.languages.extend('markup', {
	block: {
		pattern: new RegExp('{[#:/]' + blocks + '(.*)}(?=[ \t\n])'),
		inside: {
			punctuation: /{|}/,
			keyword: [new RegExp('[#:/]' + blocks), /as/, /then/],
			js_expr: {
				pattern: /[\s\S]+/,
				inside: Prism.languages['javascript'],
			},
		},
	},
	tag: {
		pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/i,
		greedy: true,
		inside: {
			tag: {
				pattern: /^<\/?[^\s>\/]+/i,
				inside: {
					punctuation: /^<\/?/,
					namespace: /^[^\s>\/:]+:/,
				},
			},
			'attr-value': {
				pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/i,
				inside: {
					punctuation: [
						/^=/,
						{
							pattern: /^(\s*)["']|["']$/,
							lookbehind: true,
						},
					],
					'sv-expr': {
						pattern: /{[\s\S]+}/,
						inside: {
							punctuation: /{|}/,
							'js-expr': {
								pattern: /[\s\S]+/,
								inside: Prism.languages['javascript'],
							},
						},
					},
				},
			},
			punctuation: /\/?>/,
			'attr-name': {
				pattern: /[^\s>\/]+/,
				inside: {
					namespace: /^[^\s>\/:]+:/,
				},
			},
		},
	},
	'sv-expr': {
		pattern: /\{[^]*?\}/,
		lookbehind: true,
		inside: {
			punctuation: /{|}/,
			'js-expr': {
				pattern: /[^]*/,
				lookbehind: true,
				inside: Prism.languages['javascript'],
			},
		},
	},
});

Prism.languages.svelte['tag'].inside['attr-value'].inside['entity'] =
	Prism.languages.svelte['entity'];

Prism.hooks.add('wrap', env => {
	if (env.type === 'entity') {
		env.attributes['title'] = env.content.replace(/&amp;/, '&');
	}
});

Object.defineProperty(Prism.languages.svelte.tag, 'addInlined', {
	value: function addInlined(tagName, lang) {
		const includedCdataInside = {};
		includedCdataInside['language-' + lang] = {
			pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
			lookbehind: true,
			inside: Prism.languages[lang],
		};
		includedCdataInside['cdata'] = /^<!\[CDATA\[|\]\]>$/i;

		const inside = {
			'included-cdata': {
				pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
				inside: includedCdataInside,
			},
		};
		inside['language-' + lang] = {
			pattern: /[\s\S]+/,
			inside: Prism.languages[lang],
		};

		const def = {};
		def[tagName] = {
			pattern: RegExp(
				/(<__[\s\S]*?>)(?:<!\[CDATA\[[\s\S]*?\]\]>\s*|[\s\S])*?(?=<\/__>)/.source.replace(
					/__/g,
					tagName
				),
				'i'
			),
			lookbehind: true,
			greedy: true,
			inside,
		};

		Prism.languages.insertBefore('svelte', 'cdata', def);
	},
});

Prism.languages.svelte.tag.addInlined('style', 'css');
Prism.languages.svelte.tag.addInlined('script', 'javascript');
