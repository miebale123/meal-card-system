import { serviceRouter, withStudent } from '../../core/http.js';
import { tickTodaysMeal } from './meals.js';

export const mealsRouter = serviceRouter();

mealsRouter.post('/scan', withStudent, (req, res) => res.json(tickTodaysMeal(req.student)));
