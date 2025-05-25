import { scenarios } from '@/config/scenarios';


export const meta = scenarios.map(({ title, description, href }) => ({
  title,
  description,
  href,
}));
