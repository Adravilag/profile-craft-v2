import Badge from './Badge';

const meta: any = { title: 'Projects/Badge', component: Badge };
export default meta;

export const Default = () => <Badge label="JavaScript" />;

export const WithIcon = () => <Badge label="TypeScript" icon={<i className="fab fa-js" />} />;
