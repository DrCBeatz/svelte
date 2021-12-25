import * as assert from 'assert';
import './main.svelte';

export default function (target) {
	console.log(target);
	assert.equal(true, true);
}
