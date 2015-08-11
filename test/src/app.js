import tevatron from '../../dist/tevatron.js';
import 'document-register-element';
import components from '../dist/components';

tevatron(components.all());
tevatron({
	name: 'test-two',
	template: document.getElementById('test-two-template')
});