export default (config) => {
	const {
		name,
		route,
	} = config;
	const nameLcase = name.replace(/^[A-Z]/, (firstLetter) => firstLetter.toLowerCase());
	const queryModule = `${nameLcase}Query`;
	return `
import ${name} from './${name}Container';
import ${queryModule} from './${queryModule}';

const routes = {
	path: '${route}',
	component: ${name},
	query: ${queryModule},
};

export default routes;
`;
};

