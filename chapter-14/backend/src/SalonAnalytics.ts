import SalonQuery from '@/src/SalonQuery';
import { createResolvers } from '@/src/axolotl.js';
import { MongOrb } from '@/src/orm.js';
import type { SourceInfer } from '@/src/sourceInfer.js';

const aggregateByField = <T>(
  objects: T[],
  aggregationKeyFn: (o: T) => string,
  aggregationValueFn?: (o: T) => number,
) => {
  const aggregatedDict: Record<string, number> = {};
  objects.forEach((o) => {
    const keyName = aggregationKeyFn(o);
    if (!aggregatedDict[keyName]) {
      aggregatedDict[keyName] = 0;
    }
    aggregatedDict[keyName] += aggregationValueFn ? aggregationValueFn(o) : 1;
  });
  return Object.entries(aggregatedDict).map(([dateKey, amount]) => ({ date: dateKey, amount }));
};

export default createResolvers({
  SalonAnalytics: {
    cashPerDay: async (yoga) => {
      const src = yoga[0] as SourceInfer<typeof SalonQuery>['SalonQuery']['analytics'];
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
      return aggregateByField(
        visits,
        (o) => o.whenDateTime.slice(0, 10),
        (o) => relatedServices.find((rs) => rs._id === o.service)?.price || 0,
      );
    },
    visitsPerDay: async (yoga) => {
      const src = yoga[0] as SourceInfer<typeof SalonQuery>['SalonQuery']['analytics'];
      const { from, to } = src.args.filterDates;
      const visits = await MongOrb('Visit')
        .collection.find({
          whenDateTime: {
            $gte: from,
            ...(to ? { $lte: to } : {}),
          },
        })
        .toArray();
      return aggregateByField(visits, (o) => o.whenDateTime.slice(0, 10));
    },
  },
});
