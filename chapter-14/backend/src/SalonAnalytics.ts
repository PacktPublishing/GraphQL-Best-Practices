import { createResolvers } from '@/src/axolotl.js';
import { MongOrb } from '@/src/orm.js';
import type { SourceInfer } from '@/src/sourceInfer.js';

export default createResolvers({
  SalonAnalytics: {
    cashPerDay: async (yoga) => {
      const src = yoga[0] as SourceInfer['SalonQuery']['analytics'];
      const { from, to } = src.args.filterDates;
      const visits = await MongOrb('Visit')
        .collection.find({
          whenDateTime: {
            $gte: from,
            ...(to ? { $lte: to } : {}),
          },
        })
        .toArray();
      const relatedServices = await MongOrb('Visit').related(visits, 'service', 'Service', '_id');
      const dateDict: Record<string, number> = {};
      visits.forEach((v) => {
        const visitService = relatedServices.find((rs) => rs._id === v.service);
        const date = v.whenDateTime.slice(0, 10);
        const price = visitService?.price || 0;
        if (!dateDict[date]) {
          dateDict[date] = 0;
        }
        dateDict[date] += price;
      });
      return Object.entries(dateDict).map(([dateKey, amount]) => ({ date: dateKey, amount }));
    },
    visitsPerDay: async (yoga) => {
      const src = yoga[0] as SourceInfer['SalonQuery']['analytics'];
      const { from, to } = src.args.filterDates;
      const visits = await MongOrb('Visit')
        .collection.find({
          whenDateTime: {
            $gte: from,
            ...(to ? { $lte: to } : {}),
          },
        })
        .toArray();
      const dateDict: Record<string, number> = {};
      visits.forEach((v) => {
        const date = v.whenDateTime.slice(0, 10);
        if (!dateDict[date]) {
          dateDict[date] = 0;
        }
        dateDict[date] += 1;
      });
      return Object.entries(dateDict).map(([dateKey, amount]) => ({ date: dateKey, amount }));
    },
  },
});
