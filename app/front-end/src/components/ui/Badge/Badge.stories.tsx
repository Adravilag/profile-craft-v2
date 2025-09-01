import Badge from './Badge';

const meta: any = { title: 'UI/Badge', component: Badge };
export default meta;

export const Default = () => <Badge label="JavaScript" />;

export const WithIcon = () => <Badge label="TypeScript" icon={<i className="fab fa-js" />} />;
