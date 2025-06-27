import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import adapter from '@sveltejs/adapter-node'

export default {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			out: 'build',
			precompress: true,
			envPrefix: 'POT_'
		}),
		alias: {
			'$c': 'src/lib/components',
			'$lib': 'src/lib',
			'$img': 'src/img',
			'$routes': 'src/routes',
			"$u": '../back/lib/u'
		}
	}
}